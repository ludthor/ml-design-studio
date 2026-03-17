import { v4 as uuidv4 } from 'uuid';
import type { Project, Block, Connection, CategoryId } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function block(
  category: CategoryId,
  label: string,
  description: string,
  rationale: string,
  tags: string[] = [],
  sortIndex = 0
): Block {
  return {
    id: uuidv4(),
    category,
    label,
    description,
    rationale,
    tags,
    isCustom: false,
    sortIndex,
    styleVariant: 'default',
  };
}

function conn(source: Block, target: Block): Connection {
  return { id: uuidv4(), sourceBlockId: source.id, targetBlockId: target.id };
}

function makeProject(title: string, blocks: Block[], connections: Connection[]): Project {
  return {
    projectId: uuidv4(),
    projectTitle: title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks,
    connections,
  };
}

// ─── Template interface ──────────────────────────────────────────────────────

export interface StarterTemplate {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  icon: string;
  accentColor: string;
  blockCount: number;
  build: () => Project;
}

// ─── 1. Image Classification ─────────────────────────────────────────────────

function buildImageClassification(): Project {
  const b = {
    problem: block('problem-framing', 'Classification', 'Classify images into predefined categories (e.g. dog breeds, X-ray diagnoses).', 'Image classification is a foundational CV task — every pixel carries spatial information the model can exploit.', ['computer-vision', 'supervised'], 0),
    data: block('data-sources', 'Images', 'A labeled collection of images organized by class.', 'Visual data requires specialized architectures (CNNs) that understand spatial relationships.', ['cv'], 0),
    labeled: block('data-sources', 'Labeled data', 'Each image has a ground-truth class label.', 'Supervised classification requires labels — model quality is directly tied to label quality.', ['supervised'], 1),
    resize: block('preprocessing', 'Resizing', 'Resize all images to a uniform input size (e.g. 224×224).', 'Neural networks need fixed input dimensions; resizing ensures consistency across the dataset.', ['cv'], 0),
    augment: block('preprocessing', 'Data augmentation', 'Apply random flips, rotations, crops, color jitter to expand the dataset.', 'Augmentation reduces overfitting by teaching the model invariance to transformations.', ['regularization'], 1),
    split: block('preprocessing', 'Train/validation/test split', 'Split data 70/15/15 stratified by class.', 'Stratified split ensures each set has the same class distribution — essential for fair evaluation.', ['best-practice'], 2),
    normalize: block('preprocessing', 'Normalization', 'Scale pixel values to [0,1] and apply ImageNet mean/std normalization.', 'Pre-trained CNNs expect ImageNet-normalized inputs; matching this improves transfer learning.', ['cv'], 3),
    cnn: block('modeling', 'CNN', 'Convolutional neural network — ResNet-50 pre-trained on ImageNet.', 'CNNs exploit spatial locality and translation invariance; pre-trained weights give a massive head start.', ['deep-learning', 'cv'], 0),
    transfer: block('modeling', 'Transfer learning', 'Use pre-trained ImageNet weights as initialization.', 'Transfer learning lets us achieve strong performance with far less data than training from scratch.', ['efficiency'], 1),
    baseline: block('modeling', 'Baseline model', 'Simple logistic regression on flattened features for comparison.', 'A baseline tells us whether the CNN actually adds value over a trivial approach.', ['evaluation'], 2),
    finetune: block('training-optimization', 'Fine-tuning', 'Freeze early layers, train classifier head + last conv blocks with small lr.', 'Early layers learn generic features (edges, textures) that transfer well; later layers need task-specific tuning.', ['deep-learning'], 0),
    adam: block('training-optimization', 'Adam', 'Adam optimizer with lr=1e-4, weight_decay=1e-5.', 'Adam adapts learning rates per parameter — good default for fine-tuning pre-trained models.', ['optimizer'], 1),
    early: block('training-optimization', 'Early stopping', 'Stop training when validation loss plateaus for 5 epochs.', 'Prevents overfitting by saving the best model and stopping before performance degrades.', ['regularization'], 2),
    acc: block('evaluation', 'Accuracy', 'Overall percentage of correct predictions.', 'Simple to interpret, but can be misleading if classes are imbalanced.', ['metric'], 0),
    f1: block('evaluation', 'F1-score', 'Harmonic mean of precision and recall, per class and macro-averaged.', 'F1 gives a balanced view when some classes are rarer than others.', ['metric'], 1),
    cm: block('evaluation', 'Confusion matrix', 'Visualize which classes the model confuses most.', 'Reveals error patterns — e.g. "model confuses huskies with wolves" — that a single number hides.', ['analysis'], 2),
    label_out: block('output-deployment', 'Class label', 'The predicted class name for each image.', 'End users need a clear, actionable answer — not just a vector of probabilities.', ['output'], 0),
    prob: block('output-deployment', 'Probability score', 'Confidence score (0–1) for each class.', 'Lets downstream systems threshold or reject low-confidence predictions.', ['output'], 1),
    api: block('output-deployment', 'API', 'REST API endpoint accepting image uploads and returning predictions.', 'An API makes the model consumable by other applications and teams.', ['deployment'], 2),
    overfit: block('risks-constraints', 'Overfitting', 'Small dataset + powerful model = memorization risk.', 'Mitigated by augmentation, early stopping, dropout, and transfer learning.', ['risk'], 0),
    bias: block('risks-constraints', 'Bias', 'Training data may underrepresent certain classes or demographics.', 'If the dataset is biased (e.g. mostly light-skinned faces), the model will inherit that bias.', ['ethics'], 1),
    compute: block('risks-constraints', 'Compute cost', 'GPU needed for training; inference is lighter but still requires consideration.', 'Fine-tuning is much cheaper than training from scratch — a key advantage of transfer learning.', ['infrastructure'], 2),
  };

  const blocks = Object.values(b);
  const connections = [
    conn(b.data, b.resize), conn(b.labeled, b.split),
    conn(b.resize, b.augment), conn(b.augment, b.normalize),
    conn(b.normalize, b.cnn), conn(b.transfer, b.finetune),
    conn(b.cnn, b.finetune), conn(b.finetune, b.acc),
    conn(b.acc, b.f1), conn(b.f1, b.cm),
    conn(b.cnn, b.label_out), conn(b.label_out, b.api),
    conn(b.problem, b.data),
  ];

  return makeProject('Image Classification Pipeline', blocks, connections);
}

// ─── 2. NLP Sentiment Analysis ───────────────────────────────────────────────

function buildSentimentAnalysis(): Project {
  const b = {
    problem: block('problem-framing', 'Classification', 'Classify customer reviews as positive, neutral, or negative sentiment.', 'Sentiment analysis is multi-class classification on text — a canonical NLP task.', ['nlp', 'supervised'], 0),
    text: block('data-sources', 'Text', 'Customer reviews from e-commerce and social media platforms.', 'Natural language is noisy, ambiguous, and context-dependent — preprocessing is critical.', ['nlp'], 0),
    labeled: block('data-sources', 'Labeled data', 'Reviews annotated with sentiment labels by human raters.', 'Human annotation is expensive but necessary; inter-annotator agreement sets the quality ceiling.', ['supervised'], 1),
    public: block('data-sources', 'Public dataset', 'SST-2, IMDB, or Yelp reviews as pre-training/augmentation source.', 'Public sentiment datasets help supplement limited proprietary data.', ['nlp'], 2),
    clean: block('preprocessing', 'Cleaning', 'Remove HTML, URLs, special characters, and normalize unicode.', 'Raw web text contains artifacts that confuse tokenizers and add noise.', ['nlp'], 0),
    token: block('preprocessing', 'Tokenization', 'WordPiece tokenization via pre-trained BERT tokenizer.', 'Subword tokenization handles rare words and out-of-vocabulary terms gracefully.', ['nlp'], 1),
    split: block('preprocessing', 'Train/validation/test split', 'Stratified 80/10/10 split preserving class balance.', 'Stratification is especially important with imbalanced sentiment classes.', ['best-practice'], 2),
    transformer: block('modeling', 'Transformer', 'BERT-base fine-tuned for sequence classification.', 'Transformers capture long-range context through self-attention — ideal for understanding nuanced sentiment.', ['deep-learning', 'nlp'], 0),
    transfer: block('modeling', 'Transfer learning', 'Start from bert-base-uncased pre-trained on English Wikipedia + BookCorpus.', 'BERT already understands English grammar and semantics; we only need to teach it sentiment.', ['efficiency'], 1),
    baseline: block('modeling', 'Baseline model', 'TF-IDF + Logistic Regression as a fast, interpretable baseline.', 'A strong baseline puts the Transformer results in context — is the complexity justified?', ['comparison'], 2),
    finetune: block('training-optimization', 'Fine-tuning', 'Fine-tune last 3 transformer layers + classification head, lr=2e-5.', 'Small learning rate preserves pre-trained knowledge while adapting to sentiment.', ['deep-learning'], 0),
    early: block('training-optimization', 'Early stopping', 'Patience=3 on validation F1.', 'BERT fine-tuning overfits quickly (3-5 epochs is typical); early stopping is essential.', ['regularization'], 1),
    f1: block('evaluation', 'F1-score', 'Macro-averaged F1 across positive/neutral/negative.', 'Macro F1 treats each class equally, regardless of frequency — important for balanced assessment.', ['metric'], 0),
    precision: block('evaluation', 'Precision', 'Per-class precision to understand false positive patterns.', 'High precision on "negative" means we rarely mislabel positive reviews as negative.', ['metric'], 1),
    recall: block('evaluation', 'Recall', 'Per-class recall to catch missed cases.', 'High recall on "negative" means we catch most actually negative reviews.', ['metric'], 2),
    error: block('evaluation', 'Error analysis', 'Manual inspection of misclassified reviews by category.', 'Shows whether errors are from sarcasm, ambiguity, or domain-specific language.', ['analysis'], 3),
    label_out: block('output-deployment', 'Class label', 'Predicted sentiment: positive, neutral, or negative.', 'A clear label is the primary output for dashboards and filters.', ['output'], 0),
    prob: block('output-deployment', 'Probability score', 'Confidence scores for each sentiment class.', 'Low-confidence predictions can be routed for human review.', ['output'], 1),
    dashboard: block('output-deployment', 'Dashboard', 'Real-time sentiment dashboard showing trends over time.', 'Business users need visual trends, not raw predictions.', ['deployment'], 2),
    bias: block('risks-constraints', 'Bias', 'Training data may over-represent certain demographics or topics.', 'Sentiment models can develop demographic biases (e.g. associating certain dialects with negativity).', ['ethics'], 0),
    privacy: block('risks-constraints', 'Privacy', 'Customer reviews may contain personal information.', 'Must anonymize PII before training — GDPR compliance is non-negotiable.', ['legal'], 1),
    drift: block('risks-constraints', 'Domain shift', 'Language evolves; slang and product names change over time.', 'A model trained on 2024 reviews may fail on 2026 slang — plan for periodic retraining.', ['maintenance'], 2),
  };

  const blocks = Object.values(b);
  const connections = [
    conn(b.problem, b.text), conn(b.text, b.clean),
    conn(b.clean, b.token), conn(b.token, b.split),
    conn(b.split, b.transformer), conn(b.transfer, b.finetune),
    conn(b.transformer, b.finetune), conn(b.finetune, b.f1),
    conn(b.f1, b.error), conn(b.transformer, b.label_out),
    conn(b.label_out, b.dashboard),
  ];

  return makeProject('NLP Sentiment Analysis', blocks, connections);
}

// ─── 3. Recommendation System ────────────────────────────────────────────────

function buildRecommendation(): Project {
  const b = {
    problem: block('problem-framing', 'Recommendation', 'Suggest relevant products to users based on purchase history and browsing behavior.', 'Recommendation blends collaborative filtering (similar users) with content-based features (similar items).', ['personalization'], 0),
    tabular: block('data-sources', 'Tabular data', 'User-item interaction matrix: purchases, ratings, clicks, and timestamps.', 'Interaction data is the backbone — implicit signals (clicks) are more abundant than explicit ones (ratings).', ['structured'], 0),
    text: block('data-sources', 'Text', 'Product descriptions and user reviews for content-based features.', 'Text adds semantic understanding of items beyond just IDs.', ['nlp'], 1),
    clean: block('preprocessing', 'Cleaning', 'Remove bots, test accounts, and sparse users/items below threshold.', 'Noise from automated accounts degrades collaborative signals.', ['data-quality'], 0),
    embed: block('preprocessing', 'Embedding', 'Learn dense embeddings for users and items via matrix factorization.', 'Embeddings capture latent preferences in a compact vector that generalizes beyond individual interactions.', ['representation'], 1),
    feat: block('preprocessing', 'Feature extraction', 'Extract category, price range, brand, and text features for content-based component.', 'Item features enable recommendations for new items with no interaction history (cold start).', ['feature-eng'], 2),
    split: block('preprocessing', 'Train/validation/test split', 'Temporal split: train on past, validate on recent, test on latest.', 'Random splitting causes data leakage — you cannot use future interactions to predict the past.', ['best-practice'], 3),
    ensemble: block('modeling', 'Ensemble', 'Hybrid model combining collaborative filtering + content-based scores.', 'Ensembling mitigates the weaknesses of each approach: cold start (collaborative) vs. filter bubble (content).', ['hybrid'], 0),
    baseline: block('modeling', 'Baseline model', 'Most-popular items as a non-personalized baseline.', 'If personalization does not beat "show the most popular items," something is fundamentally wrong.', ['comparison'], 1),
    adam: block('training-optimization', 'Adam', 'Adam optimizer for embedding learning.', 'Adam handles the sparse gradients typical in recommendation well.', ['optimizer'], 0),
    hyperparam: block('training-optimization', 'Hyperparameter search', 'Grid search over embedding dimension, regularization strength, and learning rate.', 'Embedding dimension is a critical trade-off: too small loses signal, too large overfits.', ['tuning'], 1),
    recall: block('evaluation', 'Recall', 'Recall@K: of items the user actually engaged with, how many were in the top-K?', 'In recommendations, users only see the top-K — recall@K measures coverage of their actual interests.', ['metric'], 0),
    human: block('evaluation', 'Human evaluation', 'A/B test with real users comparing old vs. new recommendations.', 'Offline metrics do not capture novelty, serendipity, or user satisfaction — only real users reveal this.', ['testing'], 1),
    fairness: block('evaluation', 'Fairness check', 'Verify recommendations do not systematically disadvantage niche interests or minority groups.', 'Popularity bias can create a filter bubble where mainstream items dominate.', ['ethics'], 2),
    rec_out: block('output-deployment', 'Recommendation', 'Ranked list of top-10 suggested products per user.', 'Users see a personalized feed; the ranking directly drives engagement.', ['output'], 0),
    api: block('output-deployment', 'API', 'Low-latency API returning personalized recommendations.', 'Sub-100ms response time is critical for real-time product pages.', ['deployment'], 1),
    realtime: block('output-deployment', 'Real-time inference', 'Update recommendations as user browses and adds items to cart.', 'Session-based context makes recommendations timely and relevant.', ['deployment'], 2),
    privacy: block('risks-constraints', 'Privacy', 'User behavior data is highly sensitive personal information.', 'Must implement data minimization, anonymization, and clear opt-out mechanisms.', ['legal'], 0),
    scalability: block('risks-constraints', 'Scalability', 'Millions of users × millions of items requires careful engineering.', 'Approximate nearest neighbor search (FAISS, Annoy) makes large-scale serving feasible.', ['infrastructure'], 1),
    bias: block('risks-constraints', 'Bias', 'Popularity bias and feedback loops can narrow recommendations over time.', 'Exploration/exploitation trade-offs and diversity constraints help break the filter bubble.', ['ethics'], 2),
  };

  const blocks = Object.values(b);
  const connections = [
    conn(b.problem, b.tabular), conn(b.tabular, b.clean),
    conn(b.clean, b.embed), conn(b.text, b.feat),
    conn(b.embed, b.ensemble), conn(b.feat, b.ensemble),
    conn(b.ensemble, b.recall), conn(b.recall, b.human),
    conn(b.ensemble, b.rec_out), conn(b.rec_out, b.api),
    conn(b.api, b.realtime),
  ];

  return makeProject('Recommendation System', blocks, connections);
}

// ─── 4. Time Series Forecasting ──────────────────────────────────────────────

function buildTimeSeriesForecasting(): Project {
  const b = {
    problem: block('problem-framing', 'Forecasting', 'Predict weekly product demand for the next 4 weeks across 50 SKUs.', 'Demand forecasting directly impacts inventory costs, stockouts, and supply chain efficiency.', ['time-series', 'regression'], 0),
    ts: block('data-sources', 'Time series', '3 years of weekly sales data per SKU with known seasonality.', 'Temporal patterns (trends, seasonality, cycles) are the primary signal in forecasting.', ['structured'], 0),
    tabular: block('data-sources', 'Tabular data', 'External features: holidays, promotions, weather, economic indicators.', 'Exogenous variables often explain demand spikes and drops better than historical sales alone.', ['structured'], 1),
    clean: block('preprocessing', 'Cleaning', 'Handle missing weeks (forward-fill), remove anomalous COVID-era data or flag it.', 'Missing values and anomalies in time series propagate through all future predictions if not addressed.', ['data-quality'], 0),
    norm: block('preprocessing', 'Normalization', 'Per-SKU min-max normalization to handle different sales scales.', 'SKUs with 10K weekly sales would dominate those with 100 — normalization levels the field.', ['scaling'], 1),
    feat: block('preprocessing', 'Feature extraction', 'Create lag features, rolling averages, day-of-week, month encodings.', 'Time-based features encode temporal patterns explicitly, making them accessible to any model.', ['feature-eng'], 2),
    split: block('preprocessing', 'Train/validation/test split', 'Temporal split: train on 2021-2023, validate on Jan-Jun 2024, test on Jul-Dec 2024.', 'NEVER shuffle time series data — the model must not see the future during training.', ['critical'], 3),
    lstm: block('modeling', 'LSTM', 'Long Short-Term Memory network processing the last 12 weeks to predict next 4.', 'LSTMs capture sequential dependencies and can learn complex temporal patterns automatically.', ['deep-learning', 'sequence'], 0),
    tree: block('modeling', 'Tree-based model', 'LightGBM/XGBoost on hand-crafted lag features as strong alternative.', 'Tree models + lag features often match or beat LSTMs on tabular time series with less tuning.', ['ml'], 1),
    baseline: block('modeling', 'Baseline model', 'Seasonal naive forecast: predict same value as same week last year.', 'If your ML model cannot beat "same as last year," the complexity is not justified.', ['comparison'], 2),
    adam: block('training-optimization', 'Adam', 'Adam optimizer for LSTM training.', 'Adam handles the varying gradient magnitudes across different time steps well.', ['optimizer'], 0),
    early: block('training-optimization', 'Early stopping', 'Monitor validation MAE with patience=10.', 'LSTM training on time series can quickly overfit to training period idiosyncrasies.', ['regularization'], 1),
    cv: block('training-optimization', 'Cross-validation', 'Time series cross-validation with expanding window.', 'Expanding window CV gives multiple evaluation points while respecting temporal order.', ['validation'], 2),
    mae: block('evaluation', 'MAE', 'Mean Absolute Error in original units (dollars/units sold).', 'MAE is interpretable: "on average, our forecast is off by X units" — directly meaningful for operations.', ['metric'], 0),
    rmse: block('evaluation', 'RMSE', 'Root Mean Squared Error to penalize large forecast errors.', 'Big misses (stockouts, massive overstock) are disproportionately costly — RMSE captures this.', ['metric'], 1),
    error: block('evaluation', 'Error analysis', 'Break errors down by SKU, season, and promotion periods.', 'Reveals whether the model struggles with specific products, holidays, or promotional effects.', ['analysis'], 2),
    forecast: block('output-deployment', 'Forecast', '4-week demand forecast per SKU with confidence intervals.', 'Confidence intervals communicate uncertainty — essential for inventory safety stock calculations.', ['output'], 0),
    dashboard: block('output-deployment', 'Dashboard', 'Interactive dashboard showing forecasts, actuals, and alerts.', 'Supply chain teams need visual tools, not CSV files.', ['deployment'], 1),
    batch: block('output-deployment', 'Batch report', 'Weekly automated forecast report emailed to regional managers.', 'Batch delivery fits the weekly planning cadence of most supply chains.', ['deployment'], 2),
    drift: block('risks-constraints', 'Domain shift', 'Consumer behavior changes, new competitors, and supply disruptions.', 'A model trained on pre-pandemic data will fail in post-pandemic conditions — monitor and retrain.', ['maintenance'], 0),
    scarcity: block('risks-constraints', 'Data scarcity', 'New SKUs have no history; seasonal products have limited data per season.', 'Cold-start problem for new products; consider hierarchical models that share strength across SKUs.', ['data'], 1),
    maintenance: block('risks-constraints', 'Maintenance', 'Weekly retraining pipeline with automated monitoring.', 'Forecasting models degrade fast — continuous retraining and monitoring are non-negotiable.', ['mlops'], 2),
  };

  const blocks = Object.values(b);
  const connections = [
    conn(b.problem, b.ts), conn(b.ts, b.clean),
    conn(b.tabular, b.feat), conn(b.clean, b.norm),
    conn(b.norm, b.feat), conn(b.feat, b.split),
    conn(b.split, b.lstm), conn(b.split, b.tree),
    conn(b.lstm, b.mae), conn(b.tree, b.mae),
    conn(b.mae, b.rmse), conn(b.rmse, b.error),
    conn(b.lstm, b.forecast), conn(b.forecast, b.dashboard),
    conn(b.forecast, b.batch),
  ];

  return makeProject('Time Series Demand Forecasting', blocks, connections);
}

// ─── 5. Anomaly Detection ────────────────────────────────────────────────────

function buildAnomalyDetection(): Project {
  const b = {
    problem: block('problem-framing', 'Detection', 'Detect fraudulent transactions in real-time from payment data streams.', 'Anomaly detection is inherently imbalanced — fraud is rare (<0.1%) but extremely costly to miss.', ['security', 'unsupervised'], 0),
    tabular: block('data-sources', 'Tabular data', 'Transaction records: amount, merchant, location, time, device fingerprint.', 'Each transaction is a feature vector; temporal patterns and user behavior profiles are key signals.', ['structured'], 0),
    sensor: block('data-sources', 'Sensor data', 'Device and network metadata: IP geolocation, browser fingerprint, session duration.', 'Device signals help distinguish legitimate users from bots and account takeovers.', ['digital'], 1),
    labeled: block('data-sources', 'Labeled data', 'Historically confirmed fraud cases (rare but essential for evaluation).', 'Labels are scarce and delayed (chargebacks take weeks) — semi-supervised approaches help.', ['supervised'], 2),
    clean: block('preprocessing', 'Cleaning', 'Handle missing fields, deduplicate, normalize currencies.', 'Payment data from multiple processors has inconsistent formats — cleaning is substantial.', ['data-quality'], 0),
    feat: block('preprocessing', 'Feature extraction', 'Velocity features (# transactions in last hour), deviation from user average, time-since-last.', 'Engineered features that capture behavioral patterns are often more powerful than raw transaction fields.', ['feature-eng'], 1),
    balance: block('preprocessing', 'Balancing', 'SMOTE or undersampling to address the extreme class imbalance (<0.1% fraud).', 'Without balancing, the model just predicts "not fraud" always and gets 99.9% accuracy.', ['imbalanced'], 2),
    norm: block('preprocessing', 'Standardization', 'Z-score standardization for neural network input.', 'Transaction amounts span orders of magnitude — standardization is essential.', ['scaling'], 3),
    autoencoder: block('modeling', 'Autoencoder', 'Train on normal transactions; anomalies have high reconstruction error.', 'Autoencoders learn "what normal looks like" without needing fraud labels — powerful for rare events.', ['deep-learning', 'unsupervised'], 0),
    tree: block('modeling', 'Tree-based model', 'Isolation Forest for fast unsupervised anomaly scoring.', 'Isolation Forest is efficient and handles high-dimensional data well with minimal tuning.', ['ml'], 1),
    ensemble: block('modeling', 'Ensemble', 'Combine autoencoder + Isolation Forest scores with supervised XGBoost.', 'Ensembling unsupervised and supervised signals covers both known and novel fraud patterns.', ['hybrid'], 2),
    dropout: block('training-optimization', 'Dropout', 'Dropout in autoencoder to prevent memorizing normal patterns too exactly.', 'Some variation in the autoencoder prevents it from reconstructing anomalies well — which is what we want.', ['regularization'], 0),
    hyperparam: block('training-optimization', 'Hyperparameter search', 'Tune anomaly threshold on validation precision-recall curve.', 'The threshold is the critical business decision: more sensitive = more fraud caught but more false alarms.', ['tuning'], 1),
    precision: block('evaluation', 'Precision', 'Of flagged transactions, what fraction were actually fraud?', 'Low precision means too many false alarms, which erode user trust and overwhelm review teams.', ['metric'], 0),
    recall: block('evaluation', 'Recall', 'Of actual fraud cases, what fraction did we catch?', 'Missing real fraud is expensive — a single large fraud can cost more than thousands of false alarms.', ['metric'], 1),
    roc: block('evaluation', 'ROC-AUC', 'Overall model discrimination across all thresholds.', 'AUC provides a threshold-independent view of model quality.', ['metric'], 2),
    robust: block('evaluation', 'Robustness check', 'Test against adversarial attack patterns and emerging fraud techniques.', 'Fraudsters adapt — the model must handle unseen attack vectors, not just historical patterns.', ['security'], 3),
    prob: block('output-deployment', 'Probability score', 'Fraud probability (0–1) for each transaction.', 'Risk score enables tiered response: auto-block high risk, queue medium for review, pass low risk.', ['output'], 0),
    realtime: block('output-deployment', 'Real-time inference', 'Sub-50ms scoring on every payment transaction.', 'Fraud must be caught before the transaction completes — latency is critical.', ['deployment'], 1),
    decision: block('output-deployment', 'Decision support interface', 'Review queue for human analysts showing risk score, explanation, and similar past cases.', 'Analysts need context to make fast decisions — not just a flag.', ['deployment'], 2),
    security: block('risks-constraints', 'Security', 'Model can be probed by adversaries to learn the decision boundary.', 'Rate limiting, input validation, and model obfuscation help protect against adversarial attacks.', ['security'], 0),
    interpret: block('risks-constraints', 'Interpretability', 'Regulators and customers may demand explanations for blocked transactions.', 'SHAP values or rule extraction from the ensemble can provide per-transaction explanations.', ['compliance'], 1),
    latency: block('risks-constraints', 'Latency', 'Must score within 50ms to not degrade payment experience.', 'Model compression, caching, and efficient serving infrastructure are critical.', ['infrastructure'], 2),
    maintenance: block('risks-constraints', 'Maintenance', 'Fraud patterns evolve rapidly — model drift is a constant threat.', 'Weekly retraining with feedback from fraud analysts keeps the model current.', ['mlops'], 3),
  };

  const blocks = Object.values(b);
  const connections = [
    conn(b.problem, b.tabular), conn(b.tabular, b.clean),
    conn(b.sensor, b.feat), conn(b.clean, b.feat),
    conn(b.feat, b.norm), conn(b.norm, b.autoencoder),
    conn(b.feat, b.tree), conn(b.autoencoder, b.ensemble),
    conn(b.tree, b.ensemble), conn(b.ensemble, b.precision),
    conn(b.precision, b.recall), conn(b.recall, b.roc),
    conn(b.ensemble, b.prob), conn(b.prob, b.realtime),
    conn(b.prob, b.decision),
  ];

  return makeProject('Fraud Detection Pipeline', blocks, connections);
}

// ─── Export all templates ────────────────────────────────────────────────────

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'image-classification',
    title: 'Image Classification',
    subtitle: 'Computer Vision',
    description:
      'A complete image classification pipeline using a pre-trained CNN with transfer learning, data augmentation, and comprehensive evaluation.',
    difficulty: 'beginner',
    tags: ['CNN', 'Transfer Learning', 'Computer Vision'],
    icon: '🖼️',
    accentColor: '#3b82f6',
    blockCount: 22,
    build: buildImageClassification,
  },
  {
    id: 'sentiment-analysis',
    title: 'Sentiment Analysis',
    subtitle: 'Natural Language Processing',
    description:
      'NLP pipeline using BERT for sentiment classification of customer reviews, with thorough preprocessing and error analysis.',
    difficulty: 'intermediate',
    tags: ['NLP', 'Transformer', 'BERT'],
    icon: '💬',
    accentColor: '#8b5cf6',
    blockCount: 22,
    build: buildSentimentAnalysis,
  },
  {
    id: 'recommendation',
    title: 'Recommendation System',
    subtitle: 'Personalization',
    description:
      'Hybrid recommendation engine combining collaborative and content-based filtering with real-time serving and fairness evaluation.',
    difficulty: 'advanced',
    tags: ['Embeddings', 'Ensemble', 'Real-time'],
    icon: '🎯',
    accentColor: '#10b981',
    blockCount: 21,
    build: buildRecommendation,
  },
  {
    id: 'time-series',
    title: 'Demand Forecasting',
    subtitle: 'Time Series',
    description:
      'Weekly demand forecasting with LSTM and tree-based models, temporal cross-validation, and supply chain deployment.',
    difficulty: 'intermediate',
    tags: ['LSTM', 'XGBoost', 'Forecasting'],
    icon: '📈',
    accentColor: '#f59e0b',
    blockCount: 22,
    build: buildTimeSeriesForecasting,
  },
  {
    id: 'anomaly-detection',
    title: 'Fraud Detection',
    subtitle: 'Anomaly Detection',
    description:
      'Real-time fraud detection using autoencoders + Isolation Forest ensemble with adversarial robustness and interpretability.',
    difficulty: 'advanced',
    tags: ['Autoencoder', 'Real-time', 'Security'],
    icon: '🛡️',
    accentColor: '#ef4444',
    blockCount: 23,
    build: buildAnomalyDetection,
  },
];
