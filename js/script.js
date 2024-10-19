document.addEventListener("DOMContentLoaded", function() {
    var addedWords = new Set();

    // List of excluded words
    var excludedWords = [
        "a", "an", "the", // Articles
        "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them", // Pronouns
        "this", "that", "these", "those", // Demonstratives
        "am", "is", "are", "was", "were", "be", "being", "been", // Forms of "be"
        "to", "of", "for", "at", "but", "if", "yet", "with", "by" // Selected prepositions
    ];

    // Load the story from the JSON file
    fetch('data/story.json')
        .then(response => response.json())
        .then(data => {
            displayStory(data);
            displayGlossary(data.glossary);
        })
        .catch(error => console.error('Error loading story:', error));

// Function to display the story and wrap words
function displayStory(data) {
    var storyText = document.getElementById("storyText");

    // Split the story into words and preserve <sup> tags as part of the words
    var words = data.body.split(/(\s+)/); // Split the story body by spaces, preserving the spaces

    storyText.innerHTML = ""; // Clear previous content

    // Iterate through each word and process it
    words.forEach((word) => {
        // Create a span for regular words
        var wordSpan = document.createElement("span");

        // Check if the word contains a <sup> tag
        if (word.includes("<sup>")) {
            // Directly add the superscript tag as HTML inside the word span
            wordSpan.innerHTML = word; // Set the superscript numbers as HTML inside the span
        } else {
            // For regular words, use textContent
            wordSpan.textContent = word;
        }

        // Sanitize the word for comparison (remove punctuation and lowercase it)
        var sanitizedWord = sanitizeWord(word).toLowerCase();

        // Only add the click event listener if the word is not in the excluded list
        if (!excludedWords.includes(sanitizedWord) && !word.includes("<sup>")) {
            // Add a click event listener to each non-excluded word
            wordSpan.addEventListener("click", function() {
                addWordToPractice(wordSpan);
                wordSpan.classList.add("clicked"); // Add 'clicked' to handle both underline and color
            });
        } else {
            // Add class to non-clickable words
            wordSpan.classList.add("non-clickable");
        }

        // Append the word span to the story text
        storyText.appendChild(wordSpan);

        // Add a space after each word or superscript tag (but not for the last word)
        storyText.appendChild(document.createTextNode(" "));
    });

    // Set the title
    document.querySelector(".title").textContent = data.title;
}

    // Function to display the glossary
    function displayGlossary(glossary) {
        var glossaryList = document.getElementById("glossaryList");
        glossaryList.innerHTML = ""; // Clear previous content

        // Add glossary entries
        Object.keys(glossary).forEach(ref => {
            var glossaryItem = document.createElement("li");

            // Wrap the glossary term in a span for hover and click behavior
            glossaryItem.innerHTML = `<sup class="glossary-ref">${ref}</sup> <span class="glossary-term">${glossary[ref].term}</span>: ${glossary[ref].definition}`;
            glossaryList.appendChild(glossaryItem);

            // Add click event to underline the glossary term
            var glossaryTerm = glossaryItem.querySelector('.glossary-term');
            glossaryTerm.addEventListener("click", function() {
                glossaryTerm.classList.add("clicked"); // Add 'clicked' to handle both underline and color
                addPhraseToPractice(glossaryTerm); // Your function to add the phrase to the list
            });
        });
    }

    // Function to sanitize words
    function sanitizeWord(word) {
        var sanitized = word.replace(/[^\w\s']/g, ''); // Remove non-alphanumeric characters
        sanitized = sanitized.replace(/\'s\b/g, ''); // Remove possessive forms like 's
        return sanitized.trim().toLowerCase(); // Trim any extra spaces and lowercase the word
    }

    function addWordToPractice(word) {
        var sanitizedWord = sanitizeWord(word.textContent);
        if (!addedWords.has(sanitizedWord)) {
            addedWords.add(sanitizedWord);
    
            // Add the 'clicked' class to keep it blue and underlined
            word.classList.add("clicked");
    
            // Create a new list item for the word
            var listItem = document.createElement("li");
            listItem.textContent = sanitizedWord;
            listItem.classList.add("word-to-practice");
    
            // Create a button to remove the word
            var removeButton = document.createElement("button");
            removeButton.textContent = "X";
            removeButton.classList.add("remove-button");
                
            // Add event listener to the remove button
            removeButton.addEventListener("click", function() {
                listItem.remove();
                addedWords.delete(sanitizedWord);

                // Remove the 'clicked' class to revert color and underline
                word.classList.remove("clicked");

                // Hide "Clear all words" button if no words are left
                if (addedWords.size === 0) {
                    clearButton.style.display = "none";
                    startText.style.display = "block"; // Show "Click a word to get started" text
                }
            });
                
            // Append the remove button to the list item
            listItem.appendChild(removeButton);
            document.getElementById("wordList").appendChild(listItem);
    
            // Show "Clear all words" button and hide the start text
            if (addedWords.size === 1) {
                clearButton.style.display = "block";
                startText.style.display = "none"; // Hide "Click a word to get started" text
            }
        }
    }
    
    function addPhraseToPractice(phrase) {
        var phraseText = phrase.textContent.split(":")[0].replace(/^\d+\s*/, '').trim();
        var sanitizedPhrase = sanitizeWord(phraseText);
        if (!addedWords.has(sanitizedPhrase)) {
            addedWords.add(sanitizedPhrase);
    
            // Add the 'clicked' class to keep it blue and underlined
            phrase.classList.add("clicked");
    
            // Create a new list item for the phrase
            var listItem = document.createElement("li");
            listItem.textContent = sanitizedPhrase;
            listItem.classList.add("word-to-practice");
    
            // Create a button to remove the phrase
            var removeButton = document.createElement("button");
            removeButton.textContent = "X";
            removeButton.classList.add("remove-button");
    
            // Add event listener to the remove button
            removeButton.addEventListener("click", function() {
                listItem.remove();
                addedWords.delete(sanitizedPhrase);

                // Remove the 'clicked' class to revert color and underline
                phrase.classList.remove("clicked");

                // Remove underline and blue from all matching glossary phrases
                document.querySelectorAll(".glossary li").forEach(function(item) {
                    item.querySelectorAll(".clicked").forEach(function(element) {
                        if (element.textContent.trim() === phraseText) {
                            element.classList.remove("clicked");
                        }
                    });
                });

                // Hide "Clear all words" button if no words are left
                if (addedWords.size === 0) {
                    clearButton.style.display = "none";
                    startText.style.display = "block"; // Show "Click a word to get started" text
                }
            });
                
            // Append the remove button to the list item
            listItem.appendChild(removeButton);
            document.getElementById("wordList").appendChild(listItem);
    
            // Show "Clear all words" button and hide the start text
            if (addedWords.size === 1) {
                clearButton.style.display = "block";
                startText.style.display = "none"; // Hide "Click a word to get started" text
            }
        }
    }
    
    // Clear all words functionality
    var clearButton = document.getElementById("clearButton");
    var startText = document.querySelector(".words-to-practice p");

    clearButton.addEventListener("click", function() {
        // Clear the word list
        document.getElementById("wordList").innerHTML = "";
        addedWords.clear();
    
        // Hide the clear button and show the start text
        clearButton.style.display = "none";
        startText.style.display = "block";
    
        // Remove the 'clicked' class from all words in the story section
        var words = document.querySelectorAll(".story p span"); // Define and select all story words
        words.forEach(function(word) {
            word.classList.remove("clicked"); // Remove 'clicked' class from all story words
        });
    
        // Remove the 'clicked' class from all glossary phrases
        document.querySelectorAll(".glossary li .glossary-term").forEach(function(phrase) {
            phrase.classList.remove("clicked"); // Remove 'clicked' class from glossary terms
        });
    });
        
    // Initially hide the "Clear all words" button
    clearButton.style.display = "none";
    startText.style.display = "block";
}); // End of DOMContentLoaded event listener
