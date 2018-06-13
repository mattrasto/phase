document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = eusocial.Network()
    // Attach some initial data
    viz.data(_graph_data)
    // Render the network visualization
    viz.render(document.getElementById('viz-container'));

    console.log("Visualization Loaded");
});





const _graph_data = {
    "links": [
    {"source": "machine_learning", "target": "supervised_learning", "type": "derivative"},
    {"source": "machine_learning", "target": "reinforcement_learning", "type": "derivative"},
    {"source": "machine_learning", "target": "structured_prediction", "type": "derivative"},
    {"source": "machine_learning", "target": "anomaly_detection", "type": "derivative"},
    {"source": "machine_learning", "target": "dimen_reduction", "type": "derivative"},
    {"source": "machine_learning", "target": "unsupervised_learning", "type": "derivative"},
    {"source": "machine_learning", "target": "semi_supervised_learning", "type": "derivative"},
    {"source": "supervised_learning", "target": "svm", "type": "derivative"},
    {"source": "supervised_learning", "target": "neural_nets", "type": "derivative"},
    {"source": "supervised_learning", "target": "markov_chains", "type": "derivative"},
    {"source": "supervised_learning", "target": "regressions", "type": "derivative"},
    {"source": "supervised_learning", "target": "naive_bayes", "type": "derivative"},
    {"source": "svm", "target": "nonlinear_svm", "type": "derivative"},
    {"source": "svm", "target": "linear_svm", "type": "derivative"},
    {"source": "neural_nets", "target": "convo_neural_nets", "type": "derivative"},
    {"source": "neural_nets", "target": "lstm", "type": "derivative"},
    {"source": "neural_nets", "target": "autoencoder", "type": "derivative"},
    {"source": "neural_nets", "target": "rec_neural_nets", "type": "derivative"},
    {"source": "neural_nets", "target": "gan", "type": "derivative"},
    {"source": "neural_nets", "target": "perceptron", "type": "derivative"},
    {"source": "markov_chains", "target": "markov_model", "type": "derivative"},
    {"source": "markov_chains", "target": "hidden_markov_model", "type": "derivative"},
    {"source": "regressions", "target": "log_regression", "type": "derivative"},
    {"source": "log_regression", "target": "simp_linear_regression", "type": "derivative"},
    {"source": "regressions", "target": "linear_regression", "type": "derivative"},
    {"source": "linear_regression", "target": "multi_linear_regression", "type": "derivative"},
    {"source": "regressions", "target": "poly_regression", "type": "derivative"},
    {"source": "regressions", "target": "curvilinear_regression", "type": "derivative"},
    {"source": "structured_prediction", "target": "decision_trees_cart", "type": "derivative"},
    {"source": "structured_prediction", "target": "boost_algos", "type": "derivative"},
    {"source": "decision_trees_cart", "target": "classification_trees", "type": "derivative"},
    {"source": "decision_trees_cart", "target": "regression_trees", "type": "derivative"},
    {"source": "decision_trees_cart", "target": "ensemble_methods", "type": "derivative"},
    {"source": "ensemble_methods", "target": "boosted_trees", "type": "derivative"},
    {"source": "boosted_trees", "target": "boost_algos", "type": "derivative"},
    {"source": "ensemble_methods", "target": "rotation_forest", "type": "derivative"},
    {"source": "ensemble_methods", "target": "boot_aggregated", "type": "derivative"},
    {"source": "boot_aggregated", "target": "rand_forest", "type": "derivative"},
    {"source": "boost_algos", "target": "grad_boost", "type": "derivative"},
    {"source": "boost_algos", "target": "adaboost", "type": "derivative"},
    {"source": "anomaly_detection", "target": "ensemble_methods", "type": "derivative"},
    {"source": "anomaly_detection", "target": "static_rules", "type": "derivative"},
    {"source": "anomaly_detection", "target": "fuzzy_outlier_detection", "type": "derivative"},
    {"source": "anomaly_detection", "target": "cluster_analysis_outlier_detection", "type": "derivative"},
    {"source": "anomaly_detection", "target": "replicator_nn", "type": "derivative"},
    {"source": "anomaly_detection", "target": "single_svm", "type": "derivative"},
    {"source": "anomaly_detection", "target": "subspace_correlation", "type": "derivative"},
    {"source": "anomaly_detection", "target": "density_techniques", "type": "derivative"},
    {"source": "density_techniques", "target": "local_outlier", "type": "derivative"},
    {"source": "density_techniques", "target": "knn", "type": "related"},
    {"source": "anomaly_detection", "target": "ensemble_methods", "type": "derivative"},
    {"source": "ensemble_methods", "target": "feature_bagging", "type": "derivative"},
    {"source": "ensemble_methods", "target": "score_norma", "type": "derivative"},
    {"source": "dimen_reduction", "target": "bayesian_models", "type": "derivative"},
    {"source": "dimen_reduction", "target": "missing_values", "type": "derivative"},
    {"source": "dimen_reduction", "target": "low_var_filter", "type": "derivative"},
    {"source": "dimen_reduction", "target": "multidimen_scaling", "type": "derivative"},
    {"source": "dimen_reduction", "target": "chisquare", "type": "derivative"},
    {"source": "dimen_reduction", "target": "stacked_autoencoders", "type": "derivative"},
    {"source": "dimen_reduction", "target": "decision_trees_ensembles", "type": "derivative"},
    {"source": "dimen_reduction", "target": "tsne", "type": "derivative"},
    {"source": "dimen_reduction", "target": "clustering", "type": "derivative"},
    {"source": "dimen_reduction", "target": "corr_analysis", "type": "derivative"},
    {"source": "dimen_reduction", "target": "rand_projections", "type": "derivative"},
    {"source": "dimen_reduction", "target": "pca", "type": "derivative"},
    {"source": "pca", "target": "kernel_pca", "type": "derivative"},
    {"source": "pca", "target": "graph_kernel_pca", "type": "derivative"},
    {"source": "pca", "target": "blind_signal", "type": "derivative"},
    {"source": "dimen_reduction", "target": "nmf", "type": "derivative"},
    {"source": "dimen_reduction", "target": "forward_feat_selection", "type": "derivative"},
    {"source": "dimen_reduction", "target": "backward_feature", "type": "derivative"},
    {"source": "dimen_reduction", "target": "high_correlation", "type": "derivative"},
    {"source": "dimen_reduction", "target": "factor_analysis", "type": "derivative"},
    {"source": "factor_analysis", "target": "efa", "type": "derivative"},
    {"source": "factor_analysis", "target": "cfa", "type": "derivative"},
    {"source": "unsupervised_learning", "target": "knn", "type": "derivative"},
    {"source": "unsupervised_learning", "target": "clustering", "type": "derivative"},
    {"source": "clustering", "target": "hierarch_clustering", "type": "derivative"},
    {"source": "hierarch_clustering", "target": "aglomerative", "type": "derivative"},
    {"source": "hierarch_clustering", "target": "divisive", "type": "derivative"},
    {"source": "clustering", "target": "centroid_clustering", "type": "derivative"},
    {"source": "centroid_clustering", "target": "kmeans_clustering", "type": "derivative"},
    {"source": "centroid_clustering", "target": "kmedians_clustering", "type": "derivative"},
    {"source": "centroid_clustering", "target": "kmeans++_clustering", "type": "derivative"},
    {"source": "centroid_clustering", "target": "fuzzy_cmeans_clustering", "type": "derivative"},
    {"source": "clustering", "target": "distri_clustering", "type": "derivative"},
    {"source": "distri_clustering", "target": "gauss_mixture", "type": "derivative"},
    {"source": "clustering", "target": "density_clustering", "type": "derivative"},
    {"source": "density_clustering", "target": "dbscan", "type": "derivative"},
    {"source": "density_clustering", "target": "optics", "type": "derivative"},
    {"source": "clustering", "target": "preclustering", "type": "derivative"},
    {"source": "preclustering", "target": "canopy_clustering", "type": "derivative"},
    {"source": "clustering", "target": "corr_clustering", "type": "derivative"},
    {"source": "corr_clustering", "target": "ccpivot", "type": "derivative"},
    {"source": "clustering", "target": "subspace_clustering", "type": "derivative"},
    {"source": "subspace_clustering", "target": "clique", "type": "derivative"},
    {"source": "subspace_clustering", "target": "subclu", "type": "derivative"},
    {"source": "unsupervised_learning", "target": "neural_nets", "type": "derivative"},
    {"source": "neural_nets", "target": "self_organ_maps", "type": "derivative"},
    {"source": "neural_nets", "target": "adapt_reson_theory", "type": "derivative"},
    {"source": "latent_var_models", "target": "exp_max_algo", "type": "derivative"},
    {"source": "latent_var_models", "target": "meth_moments", "type": "derivative"},
    {"source": "blind_signal", "target": "latent_var_models", "type": "derivative"},
    {"source": "blind_signal", "target": "csp", "type": "derivative"},
    {"source": "blind_signal", "target": "ssa", "type": "derivative"},
    {"source": "blind_signal", "target": "lccad", "type": "derivative"},
    {"source": "blind_signal", "target": "nnmf", "type": "derivative"},
    {"source": "blind_signal", "target": "dca", "type": "derivative"},
    {"source": "blind_signal", "target": "ica", "type": "derivative"},
    {"source": "blind_signal", "target": "svd", "type": "derivative"},
    {"source": "semi_supervised_learning", "target": "graph_methods", "type": "derivative"},
    {"source": "semi_supervised_learning", "target": "generative_models", "type": "derivative"},
    {"source": "semi_supervised_learning", "target": "low_density_separation", "type": "derivative"},
    {"source": "low_density_separation", "target": "transductive_svm", "type": "derivative"},
    {"source": "reinforcement_learning", "target": "evo_strategies", "type": "derivative"},
    {"source": "reinforcement_learning", "target": "markov_chains", "type": "derivative"},
    {"source": "markov_chains", "target": "markov_decision_processes", "type": "derivative"},
    {"source": "rec_neural_nets", "target": "clock_rnn", "type": "derivative"},
    {"source": "rec_neural_nets", "target": "gru", "type": "derivative"},
    {"source": "rec_neural_nets", "target": "neural_programmer", "type": "derivative"},
    {"source": "rec_neural_nets", "target": "diff_neural_comps", "type": "derivative"},
    {"source": "rec_neural_nets", "target": "neural_turing", "type": "derivative"},
    {"source": "rec_neural_nets", "target": "act_rnn", "type": "derivative"}
    ],
    "nodes": [
    {
    "id": "machine_learning",
    "name": "Machine Learning",
    "description": "Machine learning is the process of utilizing statistical models to learn from past data in order to provide clarity for new data. When doing machine learning, you need data. And often, you need a lot of data. Machine learning is deeply coupled with statistics, so to understand ML you need to understand what a statistical model does. Essentially, it takes past data and, based on the structure of that data, makes assumptions on similar data. For example, in predicting stock prices, the model may take in information such as the past prices, volumes, and other technical indicators. It uses this information to make guesses about the data. Depending on what you're trying to achieve, you can have the mode try to guess the future price, try to figure out whether some event caused a market panic, or find what kinds of data are related to each other. However, you have to be careful. As with anything in statistics, you have to be thorough in your methods. Results are not always as they seem!",
    "when": {
    "description": "These are general guidelines, but if you find any of these apply to your problem, machine learning may be helpful in finding a solution.",
    "cases": ["You have complex data", "You want to find patterns in your data", "You want to predict events", "You have lots of existing data", "You want to evolve your product to become better over time", "You've already sold your soul to statistics"]
    },
    "how": {
    "description": "Machine learning is done by optimizing a function that you specify to \"fit\" past data well, usually an error function. For example, you could say \"I want to predict house prices\" and train a model with historical data to try to make the predicted price as close as possible to the historical data's actual price. It does the hard work of finding the parameters that optimize the function for you! But be careful. Problems arise when the wrong model is chosen, bad data is used, the results are interpreted incorrectly, or the function is not fully optimized (this happens more often than you might think!).",
    "steps": ["Define your problem. Think of a very specific question you want to answer.", "Get the data relevant to finding that answer. Tons of it.", "Get more data.", "Clean your data. Figure out what parts are important. Umbrellas sold in NYC don't predict Moscow's daily temperature. (TODO: verify this)", "Decide which model / algorithm to use. Hint: this map will help!", "Pick your framework of choice.", "Build and train your model. If you do it right, you should have to wait a while for the training to finish.", "Test the results. Does it predict well? Is your data still nonsense? If not, use your knowledge gained and go back to step 1. Either way, you've now done machine learning!"]
    },
    "tools": {
    "description": "These are some of the most popular general machine learning tools.",
    "links": [
    {
    "name": "Scikit-Learn",
    "link": "http://scikit-learn.org/stable/",
    "description": "A popular open source Python ML library"
    },
    {
    "name": "mlpack",
    "link": "http://www.mlpack.org/",
    "description": "A C++ ML library focused on performance"
    },
    {
    "name": "Apache Spark MLLib",
    "link": "https://spark.apache.org/mllib/",
    "description": "Apache's ML library for Spark"
    },
    {
    "name": "Google Cloud ML",
    "link": "https://cloud.google.com/products/machine-learning/",
    "description": "Google's ML platform"
    },
    {
    "name": "Azure ML Studio",
    "link": "https://studio.azureml.net/",
    "description": "Microsoft's ML platform"
    },
    {
    "name": "Amazon ML",
    "link": "https://aws.amazon.com/machine-learning/",
    "description": "Amazon's ML platform"
    }
    ]
    },
    "links": {
    "description": "Here are some of the best general machine learning tutorials I've come across.",
    "links": [
    {
    "name": "Coursera: Stanford Machine Learning",
    "link": "https://www.coursera.org/learn/machine-learning",
    "description": "This course by Andrew Ng is perfect for machine learning beginners. It covers the topics, math, and motivations for machine learning."
    },
    {
    "name": "TopTal Machine Learning Primer",
    "link": "https://www.toptal.com/machine-learning/machine-learning-theory-an-introductory-primer",
    "description": "This is a great introductory tutorial with an excellent example."
    },
    {
    "name": "Machine Learning Mastery",
    "link": "http://machinelearningmastery.com/start-here/#getstarted",
    "description": "This is one of my favorite blogs. This post is geared towards those just getting started."
    }
    ]
    },
    "keywords": ["machine learning", "ai", "general", "predict", "classify", "reinforce", "improve", "data"]
    },
    {
    "id": "supervised_learning",
    "name": "Supervised Learning",
    "description": "Supervised learning is achieved by building a learning model and training the algorithm on labeled data points. Supervised learning can be broken down into two classes: prediction and classification. Both of these require that the algorithm knows something about what patterns the data holds so that it can predict or classify new examples properly. Therefore, we need what is called \"labeled\" data. This means that along with past examples' features, we also have what we as humans would consider the correct answer. Then, we feed these example + answer pairs into our algorithm to try to learn some way to represent this data in a way that it can then predict or classify new examples using this representation. This is called \"training\" the model. Supervised learning then, is any machine learning algorithm that uses labeled data to make guesses about new examples!",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "neural_nets",
    "name": "Neural Networks",
    "description": "Artificial neural networks are systems modeled after how our brain works; data is sent between neurons to come to a single conclusion. Neural networks are great for highly complex problems, such as image processing. They can also be leveraged to process traditionally difficult data, such as sequential data. It's important to note that \"neural network\" is an umbrella term, and that there are many different types of NNs with infinite ways to arrange them. Each neural network architecture, or topology, is engineered to work well for a specific type of data. For example, RNNs have a unique architecture that makes them very efficient at modeling sequential data.",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "convo_neural_nets",
    "name": "CNN",
    "description": "A Convolutional Neural Network (CNN) is the favored type of model for image recognition. It essentially has two sections of layers: the first section contains convolutional and pooling layers that try to \"encode\" the input, and the second section that uses fully connected layers to try to learn a good representation of the encoded input. If this sounds convoluted, that's because it is.",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "rec_neural_nets",
    "name": "RNN",
    "description": "Recurrent Neural Networks are designed to be useful for sequential data, making them very popular in natural language tasks, like NLP or handwriting / speech recognition. The way this is achieved is by adding feedback loops to all of the neurons in the hidden layers. This means the output of a neuron can feed back into itself. So how does this help us represent abritrary length sequences? Well, the feedback loop can be thought of as a way for the neuron to \"remember\" the data it processed in the past. If the neuron is trained to remember multiple states back, then a potentially infinite long sequence can be modeled! But this is hard. How does the neuron get trained in this way? We run into a problem where the neuron may forget past data, because it gets muddled with all of the previous data. After all, when it's training, it doesn't know whether the most important stage is 5 or 5,000 examples in the past. This is called the \"vanishing gradient\" problem. Despite this, RNNs are great for learning sequential data if they are engineered correctly. One thing to note is that the order in which the training data is fed into the model matters. Because RNNs look for sequential data, it wouldn't make sense to jumble up the sequences during training. For example, think about handwriting recognition; if you fed in the training data backwards (the reverse of your handwriting), it wouldn't be able to predict how you your normal writing!",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "lstm",
    "name": "LSTM",
    "description": "A long short-term memory network is an improved type of RNN that uses a \"memory cell\" in each neuron in its hidden layers to keep track of past information. Recall that RNNs are used primarily to model sequential data. One of the biggest problems with traditional RNNs is that long-term sequences are difficult to model. This is called the vanishing gradient problem, so named because the reason long sequences cannot be effectively modeled is that as we get further along in a sequence in the input data, weights will tend towards 0 and never cause the neuron's state to change. LSTMs solve this issue with allowing the cells to decide what information it holds onto over time. Each neuron's memory cell (usually) has three gates: input, forget, and output. The input gate allows new information to update the cell's memory, the forget gate determines which information the cell should throw away, and the output gate decides what information gets sent out from the current node. The neat thing about LSTMs is that these gates also learn what information to keep and let go over time! Not only does the LSTM configure its network weights dynamically, but it tries to remember the right information. This is extremely useful, and allows these types of networks to reach much better results for long-term sequential data.",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": [
    {
    "name": "Understanding LSTM Networks",
    "link": "https://colah.github.io/posts/2015-08-Understanding-LSTMs/",
    "description": "Chris Olah provides a great explanation of LSTMs on his blog."
    }
    ]
    },
    "keywords": []
    },
    {
    "id": "gru",
    "name": "GRU",
    "description": "A Gated Recurrent Unit is a derivative of the LSTM network model with performance improvements. While it uses the same idea of using a memory cell with gates to manage the flow of information in and out of each hidden layer neuron, except it only has two gates: reset and update. The reset gate determines how much information is allowed into the memory cell, and the update gate chooses how much memory needs to be retained.",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "neural_turing",
    "name": "Neural Turing Machine",
    "description": "Neural Turing Machines are a type of RNN that allows every hidden layer neuron to access information from the same memory bank. The model is named for Alan Turing's computational model, which is to this day a critical piece of work in the computer science field.",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "diff_neural_comps",
    "name": "Differentiable Neural Computers",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": [
    {
    "name": "DeepMind: Differentiable neural computers",
    "link": "https://deepmind.com/blog/differentiable-neural-computers/",
    "description": "DeepMind's blog covers their experience with DNCs."
    }
    ]
    },
    "keywords": []
    },
    {
    "id": "clock_rnn",
    "name": "Clockwork RNN",
    "description": "The Clockwork RNN is an adaptation of basic RNN models that focuses on reducing model complexity and improving memory. The LSTM model was developed to improve memory in traditional RNNs for long sequences in data, but LSTM is computationally expensive. The clockwork RNN improves upon LSTM models by simplifying the memory architecture without affecting performance. In fact, as posited by the initial paper, clockwork RNNs score much better on time series prediction tasks than LSTMs. The clockwork RNN groups hidden layer neurons into \"modules\" that work at different \"speeds,\" which affect how fast the computations are performed and changes to the neuron state is propagated.",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": [
    {
    "name": "Koutník et al.",
    "link": "https://arxiv.org/pdf/1402.3511v1.pdf",
    "description": "This paper from the folks at the Swiss AI lab IDSIA describes the method in full."
    }
    ]
    },
    "keywords": []
    },
    {
    "id": "act_rnn",
    "name": "Adaptive Computation Time RNN",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "neural_programmer",
    "name": "Neural Programmer",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "gan",
    "name": "GAN",
    "description": "A Generative Adversarial Network (GAN) is a type of semi-supervised neural network that, in a very general way, attempts to perform a variation of the Turing Test to optimize itself. It does this by training two networks at the same time: a generator, and a discriminator.",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "perceptron",
    "name": "FFNN / Perceptron",
    "description": "Perceptrons are an essential concept for neural networks. The earliest artificial neural networks were simply multi-layer perceptrons. While the more recently invented network topologies are used more commonly these days, there are still uses for simple feed-forward networks.",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "autoencoder",
    "name": "Autoencoder",
    "description": "Autoencoders are a type of unsupervised neural network built for the purpose of simplifying an input into a more meaningful representation. The input layer is essentially \"compressed\" in the middle layers by forming a \"funnel\" with the network model; the hidden layers have fewer neurons than the input and output layers. The model is different than most neural networks, since its unsupervised. The goal of the network is to find a good representation of the input for other supervised methods, not do any predictions itself, so the output layer is actually the same size as the input layer. The network attempts to reconstruct the input layer in the output layer, but since the hidden layers have fewer neurons, some information is lost. This forces the model to only store the most essential attributes for representing the input in the hidden layers, and this more compact representation can be fed into other supervised algorithms to (hopefully) boost efficiency. The concept is similar to dimensionality reduction, where the input is reduced to ignore features that have offer little to the predictive power of the model. In the case of autoencoders, however, important aspects of a dimension may be kept, while part of the dimension may be discarded.",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "svm",
    "name": "Support Vector Machines",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "nonlinear_svm",
    "name": "Non-Linear SVM",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "linear_svm",
    "name": "Linear SVM",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "naive_bayes",
    "name": "Naive Bayes",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "regressions",
    "name": "Regressions",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "log_regression",
    "name": "Logistic Regression",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "simp_linear_regression",
    "name": "Simple Linear Regression",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "multi_linear_regression",
    "name": "Multiple Linear Regression",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "linear_regression",
    "name": "Linear Regression",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "curvilinear_regression",
    "name": "Curvilinear Regression",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "poly_regression",
    "name": "Polynomial Regression",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "markov_chains",
    "name": "Markov Chains",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "markov_model",
    "name": "Markov Model",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "hidden_markov_model",
    "name": "Hidden Markov Model",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "unsupervised_learning",
    "name": "Unsupervised Learning",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "semi_supervised_learning",
    "name": "Semi-Supervised Learning",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "reinforcement_learning",
    "name": "Reinforcement Learning",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "anomaly_detection",
    "name": "Anomaly Detection",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "dimen_reduction",
    "name": "Dimensionality Reduction",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "structured_prediction",
    "name": "Structured Prediction",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "decision_trees_cart",
    "name": "Decision Trees (CART)",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "classification_trees",
    "name": "Classification Trees",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "regression_trees",
    "name": "Regression Trees",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "ensemble_methods",
    "name": "Ensemble Methods",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "boosted_trees",
    "name": "Boosted Trees",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "rotation_forest",
    "name": "Rotation Forest",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "boot_aggregated",
    "name": "Bootstrap Aggregated",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "rand_forest",
    "name": "Random Forest",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "boost_algos",
    "name": "Boosting Algorithms",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "grad_boost",
    "name": "Gradient Boosting",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "adaboost",
    "name": "AdaBoost",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "feature_bagging",
    "name": "Feature Bagging",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "score_norma",
    "name": "Score Normalization",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "static_rules",
    "name": "Static Rules",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "fuzzy_outlier_detection",
    "name": "Fuzzy-Logic-Based Outlier Detection",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "cluster_analysis_outlier_detection",
    "name": "Cluster-Analysis-Based Outlier Detection",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "replicator_nn",
    "name": "Replicator NN",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "single_svm",
    "name": "Single Class SVM",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "subspace_correlation",
    "name": "Subspace-Based / Correlation-Based",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "density_techniques",
    "name": "Density-Based Techniques",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "knn",
    "name": "K-Nearest Neighbor",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "local_outlier",
    "name": "Local Outlier Factor",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "high_correlation",
    "name": "High Correlation",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "backward_feature",
    "name": "Backward Feature Elimination",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "forward_feat_selection",
    "name": "Forward Feature Selection / Construction",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "nmf",
    "name": "NMF",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "pca",
    "name": "PCA",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "graph_kernel_pca",
    "name": "Graph-Based Kernel PCA",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "kernel_pca",
    "name": "Kernel PCA",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "rand_projections",
    "name": "Random Projections",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "corr_analysis",
    "name": "Correspondence Analysis",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "clustering",
    "name": "Clustering",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "tsne",
    "name": "t-SNE",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "decision_trees_ensembles",
    "name": "Decision Tree Ensembles",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "stacked_autoencoders",
    "name": "Stacked Autoencoders",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "chisquare",
    "name": "Chi-square / Information Gain",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "multidimen_scaling",
    "name": "Multidimensional Scaling",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "low_var_filter",
    "name": "Low Variance Filter",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "missing_values",
    "name": "Missing Values Ratio",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "bayesian_models",
    "name": "Bayesian Models",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "factor_analysis",
    "name": "Factor Analysis",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "efa",
    "name": "EFA",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "cfa",
    "name": "CFA",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "latent_var_models",
    "name": "Latent Variable Models",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "blind_signal",
    "name": "Blind Signal Separation",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "svd",
    "name": "SVD",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "ica",
    "name": "ICA",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "dca",
    "name": "DCA",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "nnmf",
    "name": "NNMF",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "lccad",
    "name": "LCCAD",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "ssa",
    "name": "SSA",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "csp",
    "name": "CSP",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "meth_moments",
    "name": "Method of Moments",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "exp_max_algo",
    "name": "Expectation-Maximization Algorithm",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "self_organ_maps",
    "name": "Self-Organizing Maps",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "adapt_reson_theory",
    "name": "Adaptive Resonance Theory",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "hierarch_clustering",
    "name": "Hierarchical Clustering",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "aglomerative",
    "name": "Aglomerative",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "divisive",
    "name": "Divisive",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "centroid_clustering",
    "name": "Centroid-Based Clustering",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "kmeans_clustering",
    "name": "k-means Clustering",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "kmedians_clustering",
    "name": "k-medians Clustering",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "kmeans++_clustering",
    "name": "k-means++ Clustering",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "fuzzy_cmeans_clustering",
    "name": "Fuzzy c-means Clustering",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "distri_clustering",
    "name": "Distribution-Based Clustering",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "gauss_mixture",
    "name": "Gaussian Mixture Models",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "density_clustering",
    "name": "Density-Based Clustering",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "dbscan",
    "name": "DBSCAN",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "optics",
    "name": "OPTICS",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "preclustering",
    "name": "Pre-Clustering",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "canopy_clustering",
    "name": "Canopy Clustering",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "corr_clustering",
    "name": "Correlation Clustering",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "ccpivot",
    "name": "CC-Pivot",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "subspace_clustering",
    "name": "Subspace Clustering",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "clique",
    "name": "CLIQUE",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "subclu",
    "name": "SUBCLU",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "graph_methods",
    "name": "Graph-Based Methods",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "generative_models",
    "name": "Generative Models",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "low_density_separation",
    "name": "Low-Density Separation",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "transductive_svm",
    "name": "Transductive SVM",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "evo_strategies",
    "name": "Evolution Strategies",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    },
    {
    "id": "markov_decision_processes",
    "name": "Markov Decision Processes",
    "description": "",
    "when": {
    "description": "",
    "cases": []
    },
    "how": {
    "description": "",
    "steps": []
    },
    "tools": {
    "description": "",
    "links": []
    },
    "links": {
    "description": "",
    "links": []
    },
    "keywords": []
    }
    ]
}
