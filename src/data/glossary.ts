import type { GlossaryEntry } from '../types';

export const GLOSSARY: GlossaryEntry[] = [
  // ── Problem Framing ─────────────────────────────────────────────────────
  {
    term: 'Classification',
    definition:
      'A supervised learning task that assigns each input to one of a fixed set of discrete categories (classes).',
    keyInsight:
      'The choice between binary (2 classes) and multi-class (3+) classification changes your loss function, metrics, and architecture. Always check if your classes are balanced.',
    pitfalls:
      'High accuracy can be misleading with imbalanced data — a model predicting the majority class 99% of the time can achieve 99% accuracy while being useless.',
    related: ['Precision', 'Recall', 'F1-score', 'Confusion matrix', 'ROC-AUC'],
  },
  {
    term: 'Regression',
    definition:
      'A supervised task that predicts a continuous numeric output rather than a category.',
    keyInsight:
      'Regression is not just curve fitting — you need to think about whether the relationship is linear or nonlinear, and whether outliers could skew your model.',
    pitfalls:
      'RMSE punishes large errors more than MAE. Choose the metric that matches your business cost — sometimes a few big errors matter more than many small ones.',
    related: ['MAE', 'RMSE', 'Linear model', 'Normalization'],
  },
  {
    term: 'Clustering',
    definition:
      'An unsupervised technique that groups similar data points without predefined labels.',
    keyInsight:
      'Clustering does not tell you what the groups mean — that requires human interpretation. The number of clusters (K) is a design choice, not a discovered truth.',
    pitfalls:
      'Different clustering algorithms (K-means, DBSCAN, hierarchical) make different assumptions about cluster shape. K-means assumes spherical clusters.',
    related: ['Unlabeled data', 'Dimensionality reduction', 'Feature extraction'],
  },
  {
    term: 'Generation',
    definition:
      'Creating new content (text, images, audio, code) that resembles the training data distribution.',
    keyInsight:
      'Generative models learn the statistical patterns of your data — they can produce plausible but factually wrong output. Evaluation is inherently difficult.',
    pitfalls:
      'Auto-metrics (BLEU, FID) capture only parts of quality. Human evaluation is essential but expensive. Generated content can also reproduce biases from training data.',
    related: ['Autoencoder', 'Transformer', 'Human evaluation'],
  },
  {
    term: 'Forecasting',
    definition:
      'Predicting future values in a time-dependent sequence based on historical patterns.',
    keyInsight:
      'Unlike standard regression, forecasting must respect temporal order — you cannot use future data to predict the past. Train/test splits must be temporal, not random.',
    pitfalls:
      'Many forecasting models struggle with regime changes (events that change the underlying pattern). Always test on recent data, not just random holdouts.',
    related: ['Time series', 'LSTM', 'RNN', 'MAE', 'RMSE'],
  },
  {
    term: 'Reinforcement learning',
    definition:
      'A paradigm where an agent learns to make sequential decisions by interacting with an environment and receiving rewards or penalties.',
    keyInsight:
      'Unlike supervised learning, RL does not need labeled data — it learns from experience. The key challenge is the exploration-exploitation trade-off: trying new actions vs. exploiting known good ones.',
    pitfalls:
      'RL is notoriously sample-inefficient and hard to train. Reward shaping is critical — a poorly designed reward function leads to unexpected and undesirable agent behavior.',
    related: ['RL agent', 'Compute cost', 'Data scarcity'],
  },
  {
    term: 'Sequence-to-sequence',
    definition:
      'A task that transforms one variable-length sequence into another — used in translation, summarization, speech-to-text, and code generation.',
    keyInsight:
      'Seq2seq architectures use an encoder to compress the input and a decoder to generate the output token by token. Attention mechanisms dramatically improved quality by letting the decoder focus on relevant input parts.',
    pitfalls:
      'Long sequences are challenging — the model can lose context. Beam search decoding is common but can produce repetitive or generic output.',
    related: ['Transformer', 'LSTM', 'BLEU / ROUGE', 'Text'],
  },

  // ── Data Sources ────────────────────────────────────────────────────────
  {
    term: 'Labeled data',
    definition:
      'Training examples where each input is paired with its correct output (ground truth).',
    keyInsight:
      'Labels are the most expensive part of ML. The quality and consistency of labels directly limits your model. Noisy labels can be worse than fewer clean labels.',
    pitfalls:
      'Label noise (incorrect annotations) is extremely common and degrades model quality silently. Always budget for label quality assurance.',
    related: ['Classification', 'Regression', 'Annotation cost'],
  },
  {
    term: 'Unlabeled data',
    definition:
      'Raw data examples without ground-truth annotations, used in unsupervised or self-supervised learning.',
    keyInsight:
      'Unlabeled data is abundant and cheap, but learning from it requires different techniques (clustering, autoencoders, contrastive learning). Pre-training on unlabeled data then fine-tuning on labels is a powerful strategy.',
    related: ['Clustering', 'Autoencoder', 'Transfer learning'],
  },
  {
    term: 'Multimodal data',
    definition:
      'Data that combines multiple types (text + images, audio + video) to provide richer signal.',
    keyInsight:
      'Multimodal models can capture cross-modal relationships (like learning that barking sounds correspond to dog images), but alignment between modalities is a major design challenge.',
    pitfalls:
      'Different modalities may have different noise levels, sampling rates, and missing-data patterns. Preprocessing each modality appropriately is critical.',
    related: ['Embedding', 'Transformer', 'Feature extraction'],
  },
  {
    term: 'Synthetic data',
    definition:
      'Artificially generated data that mimics the statistical properties of real data, used when real data is scarce, sensitive, or expensive.',
    keyInsight:
      'Synthetic data can unlock ML in privacy-sensitive domains (healthcare, finance) and help address class imbalance. GANs, diffusion models, and rule-based generators are common approaches.',
    pitfalls:
      'Synthetic data is only as good as the model that generates it. If the generator misses important patterns, the downstream model will inherit those blind spots.',
    related: ['GAN', 'Diffusion model', 'Data scarcity', 'Privacy'],
  },

  // ── Preprocessing ───────────────────────────────────────────────────────
  {
    term: 'Cleaning',
    definition:
      'Removing noise, fixing typos, dropping duplicates, and correcting inconsistencies in raw data before training.',
    keyInsight:
      'Data cleaning often has a bigger impact on model performance than choosing a fancier algorithm. Spend time here — garbage in, garbage out is the most reliable rule in ML.',
    pitfalls:
      'Aggressive cleaning can remove valuable signal. Outliers might be errors or they might be the most interesting cases (e.g., fraud). Always inspect before deleting.',
    related: ['Missing value handling', 'Normalization', 'Feature extraction'],
  },
  {
    term: 'Missing value handling',
    definition:
      'Strategies for dealing with gaps in your data — deletion, imputation (mean, median, mode), or model-based filling.',
    keyInsight:
      'Data is rarely missing at random. Understanding why values are missing is as important as how you fill them. Missing-ness itself can be a useful feature.',
    pitfalls:
      'Mean imputation distorts variance and correlations. For important features with many missing values, consider multiple imputation or training a model to predict the missing values.',
    related: ['Cleaning', 'Feature extraction', 'Balancing'],
  },
  {
    term: 'Normalization',
    definition:
      'Scaling feature values to a fixed range, typically [0, 1], so that no single feature dominates.',
    keyInsight:
      'Neural networks and distance-based algorithms (KNN, SVM) are very sensitive to feature scales. Tree-based models are generally scale-invariant.',
    pitfalls:
      'Always fit the scaler on training data only, then transform validation/test data with the same parameters. Fitting on all data causes data leakage.',
    related: ['Standardization', 'Feature extraction'],
  },
  {
    term: 'Standardization',
    definition:
      'Centering feature values to zero mean and unit variance (z-score transformation), commonly used for algorithms that assume normally distributed inputs.',
    keyInsight:
      'Unlike normalization (which squashes to [0,1]), standardization preserves outlier information and is preferred for algorithms that assume Gaussian-distributed features (logistic regression, SVM, PCA).',
    pitfalls:
      'Like normalization, fit the scaler on training data only. Standardization does not bound values to a fixed range, so outliers can still produce extreme values.',
    related: ['Normalization', 'Dimensionality reduction', 'Feature extraction'],
  },
  {
    term: 'Tokenization',
    definition:
      'Splitting raw text into discrete units (words, subwords, or characters) that a model can process.',
    keyInsight:
      'The granularity of tokenization matters enormously. Subword tokenization (BPE, WordPiece) handles rare words better than word-level, and is standard in modern NLP.',
    pitfalls:
      'Different languages, domains, and tasks may need different tokenization strategies. Medical text tokenized with a general tokenizer will split drug names badly.',
    related: ['Text', 'Embedding', 'Transformer'],
  },
  {
    term: 'Data augmentation',
    definition:
      'Artificially expanding a dataset by applying transformations (flip, rotate, crop, paraphrase) that preserve labels.',
    keyInsight:
      'Augmentation is regularization in disguise — it forces the model to learn invariance to transformations you expect in production. It is especially powerful with small datasets.',
    pitfalls:
      'Not all augmentations are label-preserving. Flipping a "6" turns it into a "9". Domain knowledge should guide which transformations are safe.',
    related: ['Data scarcity', 'Overfitting', 'Images'],
  },
  {
    term: 'Train/validation/test split',
    definition:
      'Dividing data into three non-overlapping sets for training, hyperparameter tuning, and final evaluation.',
    keyInsight:
      'The test set is sacred — you should evaluate on it only once, at the very end. If you tune on test data, your reported performance is overly optimistic.',
    pitfalls:
      'Random splits can fail for time series (temporal leakage) or grouped data (same patient in train and test). Always think about what kind of split is appropriate.',
    related: ['Cross-validation', 'Overfitting', 'Data leakage'],
  },
  {
    term: 'Embedding',
    definition:
      'A dense vector representation that maps discrete items (words, categories, users) into a continuous space where similar items are nearby.',
    keyInsight:
      'Embeddings capture semantic similarity — "king" and "queen" will be closer together than "king" and "banana". Pre-trained embeddings (Word2Vec, GloVe, BERT) capture general knowledge.',
    pitfalls:
      'Embeddings encode the biases in their training data. "Doctor" may be closer to "man" than "woman" in biased corpora.',
    related: ['Tokenization', 'Transfer learning', 'Bias'],
  },
  {
    term: 'Feature extraction',
    definition:
      'Deriving meaningful, structured signals from raw unstructured data — e.g., edges from images, TF-IDF from text, spectrograms from audio.',
    keyInsight:
      'Good features can make a simple model outperform a complex one with bad features. Deep learning automates feature extraction, but domain-crafted features still win in tabular data.',
    pitfalls:
      'Creating too many features without selection leads to the curse of dimensionality. Always validate that new features actually improve performance on a holdout set.',
    related: ['Embedding', 'Dimensionality reduction', 'Normalization'],
  },
  {
    term: 'Resizing',
    definition:
      'Transforming images, audio clips, or text sequences to a uniform input size required by the model architecture.',
    keyInsight:
      'Most model architectures require fixed-size inputs. Resizing is not just about pixels — padding sequences, cropping audio, and truncating text are all forms of resizing with trade-offs.',
    pitfalls:
      'Aggressive downscaling destroys fine details; upscaling creates artifacts. For images, consider aspect-ratio-preserving resize with padding instead of naive stretching.',
    related: ['Data augmentation', 'Normalization', 'CNN'],
  },
  {
    term: 'Balancing',
    definition:
      'Correcting class imbalance in the training set so the model does not ignore minority classes.',
    keyInsight:
      'Class imbalance is one of the most common causes of misleading accuracy. A fraud detector trained on 99.9% non-fraud data will just predict "no fraud" every time unless you balance.',
    pitfalls:
      'Oversampling minority classes (SMOTE) can cause overfitting. Undersampling majority classes discards data. Class-weighted loss functions are often a better first approach.',
    related: ['Data augmentation', 'Classification', 'Precision', 'Recall'],
  },
  {
    term: 'Dimensionality reduction',
    definition:
      'Reducing the number of input features while preserving as much information as possible, using techniques like PCA, t-SNE, or UMAP.',
    keyInsight:
      'High-dimensional data is sparse — distances between points become meaningless (curse of dimensionality). Reducing dimensions can improve both model performance and training speed.',
    pitfalls:
      'PCA is linear and may miss nonlinear structure. t-SNE/UMAP are great for visualization but should not be used to generate features for downstream models.',
    related: ['Feature extraction', 'Standardization', 'Autoencoder'],
  },
  {
    term: 'Feature selection',
    definition:
      'Choosing the most informative subset of features from the available set, removing redundant or irrelevant variables.',
    keyInsight:
      'Feature selection reduces overfitting, speeds up training, and improves interpretability. Methods range from simple correlation filtering to model-based importance (e.g. permutation importance, LASSO).',
    pitfalls:
      'Selecting features on the full dataset (including test data) causes data leakage. Always perform feature selection within cross-validation folds.',
    related: ['Feature extraction', 'Dimensionality reduction', 'Regularization'],
  },

  // ── Modeling ────────────────────────────────────────────────────────────
  {
    term: 'Baseline model',
    definition:
      'A simple, often non-ML benchmark (majority vote, mean prediction, random guess) used as a sanity check.',
    keyInsight:
      'If your complex deep learning model cannot beat a baseline, something is wrong with your data, pipeline, or task definition. Always start here.',
    related: ['Linear model', 'Error analysis', 'Accuracy'],
  },
  {
    term: 'CNN',
    definition:
      'Convolutional Neural Network — uses learned spatial filters to detect patterns in grid-structured data like images.',
    keyInsight:
      'CNNs exploit spatial locality and translation invariance — a cat is a cat regardless of where it appears in the image. This inductive bias makes them very efficient for visual tasks.',
    pitfalls:
      'CNNs need enough data to learn useful filters. For small image datasets, use transfer learning (pre-trained CNNs) rather than training from scratch.',
    related: ['Images', 'Transfer learning', 'Dropout'],
  },
  {
    term: 'Transformer',
    definition:
      'An attention-based architecture that processes all positions in parallel and learns which parts of the input to focus on.',
    keyInsight:
      'Transformers replaced RNNs as the dominant architecture for NLP and are now used for vision (ViT), audio, and multimodal tasks. Self-attention has O(n²) cost with sequence length.',
    pitfalls:
      'Transformers are data-hungry and compute-intensive. For small datasets, simpler models or fine-tuned pre-trained Transformers are better than training from scratch.',
    related: ['Text', 'Transfer learning', 'Fine-tuning', 'Compute cost'],
  },
  {
    term: 'Transfer learning',
    definition:
      'Reusing a model trained on a large dataset (like ImageNet or Wikipedia) as a starting point for a new task.',
    keyInsight:
      'Transfer learning is one of the most impactful techniques in modern ML — it lets you achieve strong performance with far less data than training from scratch. The pre-trained model provides learned features.',
    pitfalls:
      'The source and target domains should be somewhat related. A model pre-trained on English text will not transfer well to Chinese without multilingual pre-training.',
    related: ['Fine-tuning', 'CNN', 'Transformer', 'Data scarcity'],
  },
  {
    term: 'Ensemble',
    definition:
      'Combining predictions from multiple models to achieve better accuracy and robustness than any single model.',
    keyInsight:
      'Ensembles work because individual models make different errors. Averaging their predictions smooths out individual mistakes. Winning Kaggle solutions almost always use ensembles.',
    pitfalls:
      'Ensembles increase inference time and complexity. In production systems with latency constraints, a single well-tuned model may be preferable.',
    related: ['Tree-based model', 'Baseline model', 'Hyperparameter search'],
  },
  {
    term: 'Autoencoder',
    definition:
      'A neural network that learns to compress input into a compact representation (latent space) and reconstruct it.',
    keyInsight:
      'Autoencoders are unsupervised — they learn without labels. The latent space captures the most important features. They are used for dimensionality reduction, denoising, and anomaly detection.',
    pitfalls:
      'A powerful autoencoder that perfectly reconstructs everything has not learned useful features — it may have just memorized. Add bottleneck or noise for useful compression.',
    related: ['Dimensionality reduction', 'Unlabeled data', 'Detection'],
  },
  {
    term: 'SVM',
    definition:
      'Support Vector Machine — finds the hyperplane that maximizes the margin between classes, with kernel tricks for nonlinear boundaries.',
    keyInsight:
      'SVMs excel on medium-sized datasets with clear class separation. The kernel trick lets them handle nonlinear data without explicitly computing high-dimensional features.',
    pitfalls:
      'SVMs do not scale well to very large datasets (training is O(n²) to O(n³)). They also require careful feature scaling and kernel/parameter selection.',
    related: ['Classification', 'Normalization', 'Linear model'],
  },
  {
    term: 'KNN',
    definition:
      'K-Nearest Neighbors — classifies a data point by the majority vote of its K closest neighbors in feature space.',
    keyInsight:
      'KNN is a non-parametric, instance-based method — it stores all training data and makes predictions at query time. No training phase, but inference scales with dataset size.',
    pitfalls:
      'KNN suffers from the curse of dimensionality — distance metrics become less meaningful in high dimensions. It is also sensitive to irrelevant features and feature scaling.',
    related: ['Classification', 'Normalization', 'Dimensionality reduction'],
  },
  {
    term: 'GAN',
    definition:
      'Generative Adversarial Network — a generator creates fake samples while a discriminator tries to distinguish them from real ones; both improve through competition.',
    keyInsight:
      'The adversarial training dynamic pushes the generator toward producing increasingly realistic output. GANs revolutionized image generation and are used for data augmentation, style transfer, and super-resolution.',
    pitfalls:
      'GANs are notoriously hard to train — mode collapse (generator producing limited variety) and training instability are common. Careful architecture design and hyperparameter tuning are essential.',
    related: ['Generation', 'Diffusion model', 'Synthetic data'],
  },
  {
    term: 'Diffusion model',
    definition:
      'A generative model that learns to reverse a gradual noising process, iteratively denoising random noise into structured output.',
    keyInsight:
      'Diffusion models (DDPM, Stable Diffusion, DALL-E) produce higher-quality and more diverse output than GANs, with more stable training. They now dominate image, audio, and video generation.',
    pitfalls:
      'Inference is slow due to iterative denoising (hundreds of steps). Distillation and faster samplers help but add complexity.',
    related: ['Generation', 'GAN', 'Compute cost'],
  },
  {
    term: 'Foundation model / LLM',
    definition:
      'A large model pre-trained on massive data (GPT, BERT, LLaMA, PaLM) that can be adapted to many downstream tasks via fine-tuning or prompting.',
    keyInsight:
      'Foundation models are the most significant shift in ML practice — instead of training task-specific models from scratch, you adapt a general-purpose model. This dramatically reduces data and compute for downstream tasks.',
    pitfalls:
      'Foundation models can hallucinate, amplify biases in pre-training data, and are expensive to run. Understanding their limitations is as important as leveraging their capabilities.',
    related: ['Transfer learning', 'Fine-tuning', 'Prompt engineering', 'Hallucination'],
  },

  // ── Training & Optimization ─────────────────────────────────────────────
  {
    term: 'Adam',
    definition:
      'Adaptive Moment Estimation — an optimizer that maintains per-parameter learning rates based on first and second moment estimates of gradients.',
    keyInsight:
      'Adam is the default optimizer for most deep learning because it works well out of the box. It adapts the learning rate for each parameter independently.',
    pitfalls:
      'Adam can converge to sharp minima that generalize poorly. For some tasks, SGD with momentum + learning rate scheduling achieves better final performance.',
    related: ['SGD', 'Learning rate tuning', 'Mini-batch training'],
  },
  {
    term: 'Early stopping',
    definition:
      'Halting training when validation performance stops improving, to prevent overfitting.',
    keyInsight:
      'Early stopping is the easiest and most effective regularization technique. It requires monitoring a validation metric after each epoch and saving the best model.',
    pitfalls:
      'Stopping too early misses potential improvement. Use patience (wait N epochs without improvement) rather than stopping at the first dip.',
    related: ['Overfitting', 'Cross-validation', 'Regularization'],
  },
  {
    term: 'Dropout',
    definition:
      'Randomly setting a fraction of neuron activations to zero during training, forcing the network to be robust.',
    keyInsight:
      'Dropout is like training an ensemble of sub-networks simultaneously. A dropout rate of 0.1–0.5 is typical. It is disabled during inference — all neurons are used.',
    pitfalls:
      'Too much dropout (>0.5) can make the model underfit. Dropout works differently with batch normalization — using both requires care.',
    related: ['Regularization', 'Overfitting', 'MLP', 'CNN'],
  },
  {
    term: 'Cross-validation',
    definition:
      'A technique that rotates which portion of data is used for validation across K folds, giving a more reliable performance estimate.',
    keyInsight:
      'K-fold cross-validation (typically K=5 or 10) uses all data for both training and validation. It gives you a mean ± std performance estimate instead of a single number.',
    pitfalls:
      'K-fold is expensive (K× training time). For very large datasets, a single holdout split is usually sufficient. For time series, use time-based folds instead.',
    related: ['Train/validation/test split', 'Hyperparameter search'],
  },
  {
    term: 'Fine-tuning',
    definition:
      'Continuing training of a pre-trained model on your specific dataset, usually with a small learning rate.',
    keyInsight:
      'Fine-tuning adapts pre-trained features to your domain. Start with the pre-trained weights, freeze early layers (generic features), and train later layers (task-specific).',
    pitfalls:
      'Too high a learning rate during fine-tuning destroys the pre-trained features (catastrophic forgetting). Start with 1/10th to 1/100th of the original training rate.',
    related: ['Transfer learning', 'Learning rate tuning', 'Transformer'],
  },
  {
    term: 'Prompt engineering',
    definition:
      'Designing effective input prompts to steer foundation model behavior without modifying model weights.',
    keyInsight:
      'Prompt engineering is the fastest way to adapt an LLM — no training required. Techniques include zero-shot, few-shot examples, chain-of-thought, and system instructions.',
    pitfalls:
      'Prompts are brittle — small changes can dramatically alter output. Results are hard to reproduce and evaluate systematically. For consistent production use, fine-tuning is often more reliable.',
    related: ['Foundation model / LLM', 'Fine-tuning', 'Generation'],
  },

  // ── Evaluation ──────────────────────────────────────────────────────────
  {
    term: 'Precision',
    definition:
      'Of all examples the model predicted as positive, what fraction were actually positive.',
    keyInsight:
      'Precision answers "when the model says yes, how often is it right?" Optimize for precision when false positives are expensive (e.g., spam filter that should not block important emails).',
    related: ['Recall', 'F1-score', 'Classification'],
  },
  {
    term: 'Recall',
    definition:
      'Of all actual positive examples, what fraction did the model correctly identify.',
    keyInsight:
      'Recall answers "of all the yes cases, how many did we find?" Optimize for recall when missing a case is dangerous (e.g., cancer screening, fraud detection).',
    related: ['Precision', 'F1-score', 'Classification'],
  },
  {
    term: 'F1-score',
    definition:
      'The harmonic mean of precision and recall, providing a single balanced summary.',
    keyInsight:
      'F1 is useful when you care about both precision and recall equally. The harmonic mean ensures that F1 is low if either precision or recall is low, unlike a simple average.',
    pitfalls:
      'F1 weighs precision and recall equally. If one matters more, use Fβ-score or optimize precision/recall individually.',
    related: ['Precision', 'Recall', 'Classification'],
  },
  {
    term: 'Confusion matrix',
    definition:
      'A table showing counts of true positives, true negatives, false positives, and false negatives.',
    keyInsight:
      'The confusion matrix reveals the pattern of errors — not just how many, but what kind. It shows whether the model confuses class A with class B specifically.',
    related: ['Precision', 'Recall', 'Accuracy', 'Error analysis'],
  },
  {
    term: 'ROC-AUC',
    definition:
      'Area Under the Receiver Operating Characteristic curve — measures classification quality across all decision thresholds.',
    keyInsight:
      'AUC = 0.5 means random guessing, 1.0 means perfect. Unlike accuracy, AUC is threshold-independent, making it great for comparing models before choosing a decision boundary.',
    pitfalls:
      'AUC can be misleading with highly imbalanced data. Consider Precision-Recall AUC as an alternative in such cases.',
    related: ['Classification', 'Precision', 'Recall'],
  },
  {
    term: 'Error analysis',
    definition:
      'Systematically examining the examples where the model fails to understand why and improve.',
    keyInsight:
      'Error analysis is where real learning happens — both for the model and for you. Look for patterns: does the model fail on short texts? Blurry images? Rare classes?',
    related: ['Confusion matrix', 'Robustness check', 'Fairness check'],
  },
  {
    term: 'BLEU / ROUGE',
    definition:
      'Standard metrics for evaluating generated text: BLEU measures n-gram precision (translation), ROUGE measures n-gram recall (summarization).',
    keyInsight:
      'These metrics compare generated text against reference texts. They are fast and automated, making them useful for development iteration, but they correlate imperfectly with human judgment.',
    pitfalls:
      'High BLEU/ROUGE does not guarantee good output — a paraphrase with different words scores low even if perfectly correct. Always complement with human evaluation for generative tasks.',
    related: ['Human evaluation', 'Sequence-to-sequence', 'Generation'],
  },
  {
    term: 'A/B testing',
    definition:
      'Comparing two system variants (A and B) by randomly exposing different user groups to each and measuring the impact on key metrics.',
    keyInsight:
      'A/B testing is the gold standard for measuring real-world impact. Offline metrics (accuracy, F1) only estimate potential — actual business value can only be measured with live users.',
    pitfalls:
      'A/B tests need sufficient sample size for statistical significance. Running too many simultaneous tests or peeking at results early leads to false conclusions.',
    related: ['Human evaluation', 'Monitoring', 'Dashboard'],
  },

  // ── Output & Deployment ─────────────────────────────────────────────────
  {
    term: 'API',
    definition:
      'A programmatic interface that lets other applications send data and receive model predictions in real time.',
    keyInsight:
      'An API makes your model useful beyond a notebook. Key design decisions include: batch vs. single-request, authentication, rate limiting, response format, and error handling.',
    pitfalls:
      'Model serving has different constraints than training: latency, throughput, and memory. A model that takes 10 seconds per prediction may not work as an API.',
    related: ['Real-time inference', 'Latency', 'Scalability'],
  },
  {
    term: 'Real-time inference',
    definition:
      'Generating predictions instantly as new data arrives, typically within milliseconds.',
    keyInsight:
      'Real-time serving requires model optimization (quantization, pruning, distillation) and infrastructure (GPU serving, model caching, load balancing).',
    pitfalls:
      'Not every application needs real-time. Batch processing (predictions computed periodically) is simpler and cheaper for many use cases.',
    related: ['API', 'Latency', 'Edge deployment'],
  },
  {
    term: 'Monitoring',
    definition:
      'Tracking model performance, data distributions, and system health in production to detect degradation before it causes harm.',
    keyInsight:
      'Models degrade silently — accuracy can drop without any visible error. Monitoring input distributions, prediction distributions, and business metrics creates an early warning system.',
    pitfalls:
      'Monitoring without action is useless. Define clear alerting thresholds and have a retraining or rollback plan ready before deployment.',
    related: ['Domain shift', 'Maintenance', 'A/B testing'],
  },

  // ── Risks & Constraints ─────────────────────────────────────────────────
  {
    term: 'Overfitting',
    definition:
      'When a model memorizes the training data instead of learning generalizable patterns, performing well on training data but poorly on new data.',
    keyInsight:
      'Overfitting is the #1 problem in ML. The gap between training and validation performance is your overfitting signal. More data, regularization, and simpler models all help.',
    pitfalls:
      'A perfect training accuracy is almost always a sign of overfitting, not a sign of a great model.',
    related: ['Early stopping', 'Dropout', 'Regularization', 'Cross-validation'],
  },
  {
    term: 'Bias',
    definition:
      'Systematic unfairness in data or algorithms that leads to discriminatory outcomes for certain groups.',
    keyInsight:
      'Bias is not just a technical problem — it is an ethical and social one. Historical bias in training data gets amplified by models. Fairness must be designed in, not checked as an afterthought.',
    pitfalls:
      'Removing sensitive attributes (gender, race) from features is not enough — other correlated features (zip code, name) can serve as proxies.',
    related: ['Fairness check', 'Privacy', 'Interpretability'],
  },
  {
    term: 'Interpretability',
    definition:
      'The ability to explain why a model made a particular decision, in terms humans can understand.',
    keyInsight:
      'Interpretability exists on a spectrum: linear models are inherently interpretable; deep networks need post-hoc tools (SHAP, LIME, attention visualization). Regulated domains often require explainability.',
    pitfalls:
      'High accuracy and high interpretability often trade off. Choose the right balance for your domain — a 1% accuracy gain is not worth losing interpretability in healthcare.',
    related: ['Bias', 'Decision support', 'Linear model'],
  },
  {
    term: 'Privacy',
    definition:
      'Protecting sensitive personal information in training data and model outputs.',
    keyInsight:
      'Models can memorize and leak training data. Techniques like differential privacy, federated learning, and data anonymization help, but each has trade-offs with model quality.',
    pitfalls:
      'Anonymization is harder than it seems — combining seemingly harmless features can re-identify individuals. Always assume the adversary is creative.',
    related: ['Bias', 'Security', 'Labeled data'],
  },
  {
    term: 'Data scarcity',
    definition:
      'Having insufficient training data to build a reliable model.',
    keyInsight:
      'Data scarcity is the most common real-world ML constraint. Mitigations: transfer learning, data augmentation, semi-supervised learning, active learning, or reformulating with simpler models.',
    related: ['Transfer learning', 'Data augmentation', 'Annotation cost'],
  },
  {
    term: 'Domain shift',
    definition:
      'When the data a model encounters in production differs systematically from its training data.',
    keyInsight:
      'Domain shift is inevitable over time — user behavior changes, environments change, language evolves. Plan for monitoring and retraining from day one.',
    pitfalls:
      'A model performing well on a test set from 2023 may fail on data from 2025. Always evaluate on the most recent data available.',
    related: ['Robustness check', 'Maintenance', 'Monitoring'],
  },
  {
    term: 'Hallucination',
    definition:
      'When a generative model produces confident but factually incorrect, fabricated, or nonsensical content.',
    keyInsight:
      'Hallucination is not a bug but an inherent property of probabilistic generation — models produce statistically plausible output, not verified facts. Retrieval-augmented generation (RAG) and grounding help mitigate it.',
    pitfalls:
      'Hallucinations are especially dangerous because they look convincing. In high-stakes domains (healthcare, legal, finance), undetected hallucinations can cause real harm.',
    related: ['Foundation model / LLM', 'Generation', 'Human evaluation'],
  },
  {
    term: 'Data leakage',
    definition:
      'When information from outside the training set inadvertently leaks into the model, causing overly optimistic evaluation results.',
    keyInsight:
      'Data leakage is one of the most common and insidious ML mistakes. Sources include: using test data for preprocessing, temporal leakage in time series, and feature engineering on the full dataset.',
    pitfalls:
      'Leakage often goes undetected until deployment, when performance mysteriously drops. Always ask: "would this information be available at prediction time in production?"',
    related: ['Train/validation/test split', 'Cross-validation', 'Feature selection'],
  },
  {
    term: 'Regulatory compliance',
    definition:
      'Legal and regulatory requirements that constrain how ML systems collect data, make decisions, and impact individuals.',
    keyInsight:
      'Regulations like GDPR (data protection), HIPAA (health data), and the EU AI Act (risk-based AI rules) are not optional. Non-compliance can result in massive fines and reputational damage.',
    pitfalls:
      'Compliance is not a one-time checkbox — it requires ongoing documentation, auditing, and adaptation as regulations evolve. Legal review should be involved early in the project.',
    related: ['Privacy', 'Bias', 'Interpretability', 'Fairness check'],
  },
  {
    term: 'Environmental impact',
    definition:
      'The energy consumption, carbon emissions, and ecological cost of training and deploying ML models.',
    keyInsight:
      'Training a single large language model can emit as much CO₂ as five cars over their lifetimes. Responsible ML means choosing efficient architectures, reusing pre-trained models, and reporting compute costs.',
    pitfalls:
      'Environmental cost is often invisible to practitioners. Consider whether the performance gain from a larger model justifies its carbon footprint.',
    related: ['Compute cost', 'Foundation model / LLM', 'Maintenance'],
  },
];

/** Look up a glossary entry by term (case-insensitive, partial match). */
export function findGlossaryEntry(term: string): GlossaryEntry | undefined {
  const lower = term.toLowerCase();
  return GLOSSARY.find((g) => g.term.toLowerCase() === lower);
}

/** Search the glossary by a query string (matches term, definition, related). */
export function searchGlossary(query: string): GlossaryEntry[] {
  if (!query.trim()) return GLOSSARY;
  const q = query.toLowerCase();
  return GLOSSARY.filter(
    (g) =>
      g.term.toLowerCase().includes(q) ||
      g.definition.toLowerCase().includes(q) ||
      g.related?.some((r) => r.toLowerCase().includes(q))
  );
}
