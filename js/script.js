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

// Function to display the glossary with aligned definitions and make terms clickable
function displayGlossary(glossary) {
    var glossaryList = document.getElementById("glossaryList");
    glossaryList.innerHTML = ""; // Clear previous content

    let longestTermLength = 0; // Track the length of the longest term

    // First pass to calculate the longest glossary term length
    Object.keys(glossary).forEach(ref => {
        var termLength = glossary[ref].term.length;
        if (termLength > longestTermLength) {
            longestTermLength = termLength;
        }
    });

    // Second pass to render glossary items with consistent term width
    Object.keys(glossary).forEach(ref => {
        var glossaryItem = document.createElement("li");
        glossaryItem.classList.add("glossary-item");

        // Create a div for the glossary term (with superscript)
        var termDiv = document.createElement("div");
        termDiv.classList.add("glossary-term");
        termDiv.innerHTML = `<sup class="glossary-ref">${ref}</sup> ${glossary[ref].term}`;

        // Apply the calculated minimum width based on the longest term
        termDiv.style.minWidth = `${longestTermLength + 2}ch`; // Ensure extra space

        // Create a div for the glossary definition
        var definitionDiv = document.createElement("div");
        definitionDiv.classList.add("glossary-definition");
        definitionDiv.textContent = glossary[ref].definition;

        // Append both the term and definition to the glossary item (on the same line)
        glossaryItem.appendChild(termDiv);
        glossaryItem.appendChild(definitionDiv);

        // Add click event to glossary term to make it clickable
        termDiv.addEventListener("click", function() {
            addPhraseToPractice(termDiv); // Add glossary phrase to "Words to Practice"
        });

        // Append the glossary item to the list
        glossaryList.appendChild(glossaryItem);
    });
}

    // Function to sanitize words
    function sanitizeWord(word) {
        var sanitized = word.replace(/[^\w\s']/g, ''); // Remove non-alphanumeric characters
        sanitized = sanitized.replace(/\'s\b/g, ''); // Remove possessive forms like 's
        return sanitized.trim().toLowerCase(); // Trim any extra spaces and lowercase the word
    }

    // Function to add a word to "Words to Practice"
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
            removeButton.addEventListener("click", function () {
                listItem.remove(); // Remove the word from the list
                addedWords.delete(sanitizedWord);

                // Remove the 'clicked' class to revert color and underline
                word.classList.remove("clicked");

                // Check if no words are left
                if (addedWords.size === 0) {
                    clearButton.style.display = "none";
                    practiceButton.style.display = "none"; // Hide Practice button
                    startText.style.display = "block"; // Show "Click a word to get started" text

                    // Reveal all previously hidden sections
                    document.querySelector(".story").classList.remove("hidden");
                    document.querySelector(".glossary").classList.remove("hidden");
                    document.querySelector(".title").classList.remove("hidden");

                    // Remove the "no-border" class
                    document.querySelector(".words-to-practice").classList.remove("no-border");
                }
            });

            // Append the remove button to the list item
            listItem.appendChild(removeButton);
            document.getElementById("wordList").appendChild(listItem);

            // Show both buttons and hide the start text if it's the first word added
            if (addedWords.size === 1) {
                clearButton.style.display = "block";
                practiceButton.style.display = "block"; // Show Practice button
                startText.style.display = "none"; // Hide "Click a word to get started" text
            }
        }
    }

    function addPhraseToPractice(phrase) {
        var phraseText = phrase.textContent.split(":")[0].replace(/^\d+\s*/, '').trim();
        var sanitizedPhrase = sanitizeWord(phraseText);
    
        if (!addedWords.has(sanitizedPhrase)) {
            addedWords.add(sanitizedPhrase);
    
            // Add the 'clicked' class for visual effect
            phrase.classList.add("clicked");
    
            // Create a new list item
            var listItem = document.createElement("li");
            listItem.textContent = sanitizedPhrase;
            listItem.classList.add("word-to-practice");
    
            // Add the remove button
            var removeButton = document.createElement("button");
            removeButton.textContent = "X";
            removeButton.classList.add("remove-button");
    
            removeButton.addEventListener("click", function () {
                listItem.remove();
                addedWords.delete(sanitizedPhrase);
    
                // Remove the 'clicked' class for visual effect
                phrase.classList.remove("clicked");
    
                // Check if no words or phrases are left
                if (addedWords.size === 0) {
                    clearButton.style.display = "none";
                    practiceButton.style.display = "none"; // Hide Practice button
                    startText.style.display = "block"; // Show the start text
    
                    // Restore hidden sections
                    document.querySelector(".story").classList.remove("hidden");
                    document.querySelector(".glossary").classList.remove("hidden");
                    document.querySelector(".title").classList.remove("hidden");
                    document.querySelector(".words-to-practice").classList.remove("no-border");
                }
            });
    
            // Append the remove button to the list item
            listItem.appendChild(removeButton);
            document.getElementById("wordList").appendChild(listItem);
    
            // Show buttons and hide the start text if it's the first entry
            if (addedWords.size === 1) {
                clearButton.style.display = "block";
                practiceButton.style.display = "block";
                startText.style.display = "none";
            }
        }
    }
        
    // Get references to the buttons and "Words to Practice" text
    var clearButton = document.getElementById("clearButton");
    var practiceButton = document.getElementById("practiceButton"); // New Practice Button
    var startText = document.querySelector(".words-to-practice p");

    // Clear all words functionality
    clearButton.addEventListener("click", function () {
        // Clear the words list
        document.getElementById("wordList").innerHTML = "";
        addedWords.clear();
    
        // Hide both buttons and show the start text
        clearButton.style.display = "none";
        practiceButton.style.display = "none";
        startText.style.display = "block";
    
        // Remove 'clicked' class from story and glossary words
        document.querySelectorAll(".story p span").forEach(word => word.classList.remove("clicked"));
        document.querySelectorAll(".glossary li .glossary-term").forEach(phrase => phrase.classList.remove("clicked"));
    
        // Reveal all sections previously hidden
        document.querySelector(".story").classList.remove("hidden");
        document.querySelector(".glossary").classList.remove("hidden");
        document.querySelector(".title").classList.remove("hidden");
    
        // Remove the "no-border" class from the Words to Practice section
        const wordsSection = document.querySelector(".words-to-practice");
        wordsSection.classList.remove("no-border");
    });
    
    clearButton.style.display = "none";     // Initially hide the "Clear all words" button
    practiceButton.style.display = "none"; // Initially hide the Practice button
    startText.style.display = "block";
}); // End of DOMContentLoaded event listener

practiceButton.addEventListener("click", () => {
    // Hide other sections
    document.querySelector(".story").classList.add("hidden");
    document.querySelector(".glossary").classList.add("hidden");
    document.querySelector(".title").classList.add("hidden");

    // Expand the "Words to Practice" section and hide its border
    const wordsSection = document.querySelector(".words-to-practice");
    wordsSection.classList.add("no-border");
});

