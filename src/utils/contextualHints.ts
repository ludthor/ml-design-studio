import type { Project, ContextualHint, CategoryId } from '../types';

export function generateHints(project: Project): ContextualHint[] {
  const hints: ContextualHint[] = [];
  const blocks = project.blocks;
  const labels = new Set(blocks.map((b) => b.label.toLowerCase()));
  const catBlocks = (cat: CategoryId) => blocks.filter((b) => b.category === cat);

  if (blocks.length === 0) return hints;

  // ── Architecture mismatch hints ────────────────────────────────────────

  // CNN without image data
  if (
    blocks.some((b) => b.label === 'CNN' && b.category === 'modeling') &&
    !blocks.some((b) => b.label === 'Images' && b.category === 'data-sources')
  ) {
    hints.push({
      id: 'cnn-no-images',
      priority: 'high',
      message: 'CNN model without Image data source',
      suggestion:
        'CNNs excel at spatial data like images. If your data isn\'t spatial, consider a different architecture (MLP, Transformer).',
    });
  }

  // Transformer/LSTM/RNN without sequence data
  const seqModels = blocks.filter(
    (b) =>
      ['Transformer', 'LSTM', 'RNN'].includes(b.label) &&
      b.category === 'modeling'
  );
  const seqDataLabels = ['Text', 'Time series', 'Audio', 'Video'];
  const hasSeqData = blocks.some(
    (b) => seqDataLabels.includes(b.label) && b.category === 'data-sources'
  );
  if (seqModels.length > 0 && !hasSeqData) {
    hints.push({
      id: 'seq-model-no-seq-data',
      priority: 'high',
      message: `${seqModels.map((m) => m.label).join(', ')} without sequence data`,
      suggestion:
        'These models are designed for sequential data. Add Text, Time series, Audio, or Video data sources.',
    });
  }

  // Tree-based model with unstructured data
  if (
    blocks.some(
      (b) => b.label === 'Tree-based model' && b.category === 'modeling'
    ) &&
    blocks.some(
      (b) =>
        ['Images', 'Audio', 'Video'].includes(b.label) &&
        b.category === 'data-sources'
    ) &&
    !blocks.some(
      (b) => b.label === 'Tabular data' && b.category === 'data-sources'
    )
  ) {
    hints.push({
      id: 'tree-unstructured',
      priority: 'medium',
      message: 'Tree-based model with unstructured data (images/audio/video)',
      suggestion:
        'Tree models work best with tabular features. For raw images/audio, consider CNNs, RNNs, or Transformers.',
    });
  }

  // ── Metric mismatch hints ─────────────────────────────────────────────

  // Classification without classification metrics
  const isClassification = blocks.some(
    (b) => b.label === 'Classification' && b.category === 'problem-framing'
  );
  const classMetrics = [
    'Accuracy',
    'Precision',
    'Recall',
    'F1-score',
    'ROC-AUC',
    'Confusion matrix',
  ];
  const hasClassMetric = blocks.some(
    (b) => classMetrics.includes(b.label) && b.category === 'evaluation'
  );
  if (isClassification && catBlocks('evaluation').length > 0 && !hasClassMetric) {
    hints.push({
      id: 'classification-wrong-metrics',
      priority: 'medium',
      message: 'Classification task with non-classification metrics',
      suggestion:
        'Consider Accuracy, Precision, Recall, F1-score, ROC-AUC, or Confusion matrix.',
    });
  }
  if (isClassification && catBlocks('evaluation').length === 0) {
    hints.push({
      id: 'classification-no-eval',
      priority: 'high',
      message: 'Classification task with no evaluation metrics',
      suggestion:
        'How will you know if your classifier works? Add Accuracy, F1-score, or Confusion matrix.',
    });
  }

  // Regression without regression metrics
  const isRegression = blocks.some(
    (b) =>
      ['Regression', 'Forecasting'].includes(b.label) &&
      b.category === 'problem-framing'
  );
  const regMetrics = ['MAE', 'RMSE'];
  const hasRegMetric = blocks.some(
    (b) => regMetrics.includes(b.label) && b.category === 'evaluation'
  );
  if (isRegression && catBlocks('evaluation').length > 0 && !hasRegMetric) {
    hints.push({
      id: 'regression-wrong-metrics',
      priority: 'medium',
      message: 'Regression/Forecasting without regression metrics',
      suggestion: 'Add MAE or RMSE to measure how close predictions are to reality.',
    });
  }

  // Generation without human evaluation
  if (
    labels.has('generation') &&
    catBlocks('evaluation').length > 0 &&
    !labels.has('human evaluation')
  ) {
    hints.push({
      id: 'generation-no-human-eval',
      priority: 'medium',
      message: 'Generative task without human evaluation',
      suggestion:
        'Generated content (text, images) is hard to judge with metrics alone. Add human evaluation.',
    });
  }

  // ── Pipeline gap hints ────────────────────────────────────────────────

  // Data but no preprocessing
  if (catBlocks('data-sources').length > 0 && catBlocks('preprocessing').length === 0) {
    hints.push({
      id: 'data-no-preprocessing',
      priority: 'medium',
      message: 'Data sources defined but no preprocessing',
      suggestion:
        'Raw data almost always needs cleaning, normalization, or feature extraction before modeling.',
    });
  }

  // No train/val/test split
  if (
    catBlocks('data-sources').length > 0 &&
    catBlocks('modeling').length > 0 &&
    !labels.has('train/validation/test split')
  ) {
    hints.push({
      id: 'no-data-split',
      priority: 'medium',
      message: 'No Train/Validation/Test split',
      suggestion:
        'Splitting data is essential to evaluate honestly and avoid overfitting. Add it to Preprocessing.',
    });
  }

  // Transfer learning without fine-tuning
  if (labels.has('transfer learning') && !labels.has('fine-tuning')) {
    hints.push({
      id: 'transfer-no-finetune',
      priority: 'low',
      message: 'Transfer learning without fine-tuning',
      suggestion:
        'Pre-trained models usually need fine-tuning on your specific task to perform well.',
    });
  }

  // No baseline model
  if (catBlocks('modeling').length > 0 && !labels.has('baseline model')) {
    hints.push({
      id: 'no-baseline',
      priority: 'low',
      message: 'No baseline model for comparison',
      suggestion:
        'A simple baseline (majority vote, mean prediction) helps you judge if your complex model adds real value.',
    });
  }

  // Supervised task without labeled data
  const supervisedTasks = [
    'Classification',
    'Regression',
    'Forecasting',
    'Detection',
    'Segmentation',
  ];
  const hasSupervisedTask = blocks.some(
    (b) => supervisedTasks.includes(b.label) && b.category === 'problem-framing'
  );
  if (hasSupervisedTask && !labels.has('labeled data')) {
    hints.push({
      id: 'supervised-no-labels',
      priority: 'medium',
      message: 'Supervised task without labeled data',
      suggestion:
        'Classification, regression, and detection need labeled training examples. Add "Labeled data" to Data Sources.',
    });
  }

  // Clustering with only labeled data
  if (
    labels.has('clustering') &&
    labels.has('labeled data') &&
    !labels.has('unlabeled data')
  ) {
    hints.push({
      id: 'clustering-labeled-only',
      priority: 'low',
      message: 'Clustering typically uses unlabeled data',
      suggestion:
        'Clustering discovers patterns without labels — consider adding "Unlabeled data" to your data sources.',
    });
  }

  // ── Critical thinking hints ───────────────────────────────────────────

  // No risks at all
  if (catBlocks('risks-constraints').length === 0 && blocks.length >= 5) {
    hints.push({
      id: 'no-risks',
      priority: 'high',
      message: 'No risks or constraints addressed',
      suggestion:
        'Every ML project has limitations. Consider overfitting, bias, privacy, compute cost, or data scarcity.',
    });
  }

  // No connections at all
  if (project.connections.length === 0 && blocks.length >= 3) {
    hints.push({
      id: 'no-connections',
      priority: 'medium',
      message: 'No connections between blocks',
      suggestion:
        'Connect blocks to show how data flows through your pipeline — from data source to output.',
    });
  }

  // Deep learning without data/compute constraints
  const deepModels = ['CNN', 'RNN', 'LSTM', 'Transformer', 'GNN', 'Autoencoder'];
  const hasDeepModel = blocks.some(
    (b) => deepModels.includes(b.label) && b.category === 'modeling'
  );
  if (
    hasDeepModel &&
    !labels.has('data scarcity') &&
    !labels.has('compute cost')
  ) {
    hints.push({
      id: 'deep-no-constraints',
      priority: 'low',
      message: 'Deep learning model without data/compute constraints',
      suggestion:
        'Deep learning needs lots of data and GPU compute. Consider adding these as risks.',
    });
  }

  // Imbalanced data possibilities
  if (isClassification && !labels.has('balancing') && catBlocks('preprocessing').length > 0) {
    hints.push({
      id: 'no-balancing',
      priority: 'low',
      message: 'Classification without considering class imbalance',
      suggestion:
        'Real-world datasets are often imbalanced. Consider adding "Balancing" to Preprocessing.',
    });
  }

  // Dropout/regularization for deep models
  if (
    hasDeepModel &&
    !labels.has('dropout') &&
    !labels.has('regularization') &&
    !labels.has('early stopping')
  ) {
    hints.push({
      id: 'deep-no-regularization',
      priority: 'low',
      message: 'Deep model without regularization techniques',
      suggestion:
        'Deep networks can easily overfit. Consider Dropout, Regularization, or Early stopping.',
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  hints.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return hints;
}
