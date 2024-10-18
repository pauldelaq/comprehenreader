document.addEventListener("DOMContentLoaded", function() {
    // Set to store words already added to the "Words to Practice" section
    var addedWords = new Set();

    // Function to sanitize words by removing punctuation and possessive forms
    function sanitizeWord(word) {
        // Remove all non-alphanumeric characters and spaces
        var sanitized = word.replace(/[^\w\s']/g, '');
        // Remove possessive forms like 's
        sanitized = sanitized.replace(/\'s\b/g, ''); // Remove 's at the end of words
        return sanitized.trim(); // Trim any leading or trailing whitespace
    }

    // Function to add a word to the "Words to Practice" section
    function addWordToPractice(word) {
        var sanitizedWord = sanitizeWord(word.textContent);
        // Check if the sanitized word is already in the set
        if (!addedWords.has(sanitizedWord)) {
            // Add the sanitized word to the set
            addedWords.add(sanitizedWord);

            // Create a new list item for the word
            var listItem = document.createElement("li");
            listItem.textContent = sanitizedWord; // Copy the sanitized word text
            listItem.classList.add("word-to-practice");

            // Create a button to remove the word
            var removeButton = document.createElement("button");
            removeButton.textContent = "X";
            removeButton.classList.add("remove-button");

            // Add event listener to the remove button
            removeButton.addEventListener("click", function() {
                listItem.remove(); // Remove the word from the list
                addedWords.delete(sanitizedWord); // Remove the sanitized word from the set
                word.classList.remove("underlined"); // Remove the underline from the word
                // Hide "Clear all words" button if no words are left
                if (addedWords.size === 0) {
                    clearButton.style.display = "none";
                    // Show "Click a word to get started" text
                    startText.style.display = "block";
                }
            });

            // Append the remove button to the list item
            listItem.appendChild(removeButton);

            // Append the list item to the "Words to Practice" section
            var wordList = document.getElementById("wordList");
            // Insert the list item at the beginning of the list
            wordList.insertBefore(listItem, wordList.firstChild);

            // Show "Clear all words" button if it's the first word added
            if (addedWords.size === 1) {
                clearButton.style.display = "block";
                // Hide "Click a word to get started" text
                startText.style.display = "none";
            }
        }
    }

    // Function to add a glossary phrase to the "Words to Practice" section
    function addPhraseToPractice(phrase) {
        // Extract the phrase text without the definition and initial number
        var phraseText = phrase.textContent.split(":")[0].replace(/^\d+\s*/, '').trim();
        var sanitizedPhrase = sanitizeWord(phraseText);
        // Check if the sanitized phrase is already in the set
        if (!addedWords.has(sanitizedPhrase)) {
            // Add the sanitized phrase to the set
            addedWords.add(sanitizedPhrase);

            // Underline only the phrase in the glossary
            phrase.innerHTML = phrase.innerHTML.replace(phraseText, "<span class='underlined'>" + phraseText + "</span>");

            // Create a new list item for the phrase
            var listItem = document.createElement("li");
            listItem.textContent = sanitizedPhrase; // Copy the sanitized phrase text
            listItem.classList.add("word-to-practice");

            // Create a button to remove the phrase
            var removeButton = document.createElement("button");
            removeButton.textContent = "X";
            removeButton.classList.add("remove-button");

            // Add event listener to the remove button
            removeButton.addEventListener("click", function() {
                listItem.remove(); // Remove the phrase from the list
                addedWords.delete(sanitizedPhrase); // Remove the sanitized phrase from the set
                
                // Remove underline from all glossary phrases
                document.querySelectorAll(".glossary li").forEach(function(phrase) {
                    phrase.querySelectorAll(".underlined").forEach(function(element) {
                        if (element.textContent.trim() === phraseText) {
                            element.classList.remove("underlined");
                        }
                    });
                });
            });

            // Append the remove button to the list item
            listItem.appendChild(removeButton);

            // Append the list item to the "Words to Practice" section
            var wordList = document.getElementById("wordList");
            // Insert the list item at the beginning of the list
            wordList.insertBefore(listItem, wordList.firstChild);

            // Show "Clear all words" button if it's the first word added
            if (addedWords.size === 1) {
                clearButton.style.display = "block";
                // Hide "Click a word to get started" text
                startText.style.display = "none";
            }
        }
    }

    // Get all words in the story section
    var words = document.querySelectorAll(".story p span");

    // Add click event listeners to words in the story section
    words.forEach(function(word) {
        word.addEventListener("click", function() {
            // Add word to "Words to Practice" section
            this.classList.add("underlined");
            addWordToPractice(this);
        });
    });

    // Add event listener to glossary phrases
    document.querySelectorAll(".glossary li").forEach(function(phrase) {
        phrase.addEventListener("click", function() {
            // Add phrase to "Words to Practice" section
            addPhraseToPractice(this);
        });
    });

    // Clear all words from the "Words to Practice" section
    var clearButton = document.getElementById("clearButton");
    var startText = document.querySelector(".words-to-practice p"); // Get the "Click a word to get started" text
    clearButton.addEventListener("click", function() {
        var wordList = document.getElementById("wordList");
        wordList.innerHTML = ""; // Remove all list items

        // Remove underline from all words in the story section
        words.forEach(function(word) {
            word.classList.remove("underlined");
        });

        // Remove underline from all glossary phrases
        document.querySelectorAll(".glossary li").forEach(function(phrase) {
            phrase.querySelectorAll(".underlined").forEach(function(element) {
                element.classList.remove("underlined");
            });
        });

        // Clear the set of added words
        addedWords.clear();

        // Hide "Clear all words" button
        clearButton.style.display = "none";
        // Show "Click a word to get started" text
        startText.style.display = "block";
    });

    // Initially hide the "Clear all words" button
    clearButton.style.display = "none";

    // Initially hide the "Click a word to get started" text
    startText.style.display = "block";
});
