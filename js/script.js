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

    words.forEach((word) => {
        var wordSpan = document.createElement("span");

        // Handle <sup> tags
        if (word.includes("<sup>")) {
            wordSpan.innerHTML = word; // Set superscript directly
        } else {
            // Remove stars for display purposes
            var displayWord = word.replace(/\*/g, ""); // Strip stars
            wordSpan.textContent = displayWord;

            // Store the original word (with stars) as a data attribute
            wordSpan.setAttribute("data-original-word", word);
        }

        // Sanitize the word for logic
        var sanitizedWord = sanitizeWord(word).toLowerCase();

        // Only add the click event listener if the word is not excluded
        if (!excludedWords.includes(sanitizedWord) && !word.includes("<sup>")) {
            wordSpan.addEventListener("click", function() {
                // Use the original word for data logic
                addWordToPractice(wordSpan);
                wordSpan.classList.add("clicked");
            });
        } else {
            wordSpan.classList.add("non-clickable");
        }

        storyText.appendChild(wordSpan);
        storyText.appendChild(document.createTextNode(" ")); // Add space
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
        var termLength = glossary[ref].term.replace(/\*/g, "").length; // Ignore stars for width calculation
        if (termLength > longestTermLength) {
            longestTermLength = termLength;
        }
    });

    // Second pass to render glossary items with consistent term width
    Object.keys(glossary).forEach(ref => {
        var glossaryItem = document.createElement("li");
        glossaryItem.classList.add("glossary-item");

        // Process the term: Remove stars for display, but store raw term for logic
        var rawTerm = glossary[ref].term; // Raw term with stars
        var cleanTerm = rawTerm.replace(/\*/g, ""); // Remove stars for display

        // Create a div for the glossary term (with superscript)
        var termDiv = document.createElement("div");
        termDiv.classList.add("glossary-term");
        termDiv.innerHTML = `<sup class="glossary-ref">${ref}</sup> ${cleanTerm}`;

        // Attach the raw term (with stars) as a data attribute for backend logic
        termDiv.setAttribute("data-original-term", rawTerm);

        // Apply the calculated minimum width based on the longest clean term
        termDiv.style.minWidth = `${longestTermLength + 2}ch`;

        // Create a div for the glossary definition
        var definitionDiv = document.createElement("div");
        definitionDiv.classList.add("glossary-definition");
        definitionDiv.textContent = glossary[ref].definition;

        // Append both the term and definition to the glossary item (on the same line)
        glossaryItem.appendChild(termDiv);
        glossaryItem.appendChild(definitionDiv);

        // Add click event to glossary term to make it clickable
        termDiv.addEventListener("click", function() {
            addPhraseToPractice(termDiv); // Pass the termDiv for processing
        });

        // Append the glossary item to the list
        glossaryList.appendChild(glossaryItem);
    });
}

    // Function to sanitize words
    function sanitizeWord(word) {
        if (word.includes("*")) {
            // Split into preserved part (before *) and sanitizable part (after *)
            const [preservePart, sanitizePart] = word.split("*", 2);
    
            // Sanitize the part after the star (remove non-alphanumeric characters and possessives)
            let sanitizedPart = sanitizePart.replace(/[^\w\s]/g, '').replace(/\'s\b/g, '').trim();
    
            // If the sanitized part is empty or just 's', discard it
            sanitizedPart = sanitizedPart === 's' || sanitizedPart === '' ? '' : sanitizedPart;
    
            // Combine the preserved part and sanitized part
            return preservePart + sanitizedPart;
        } else {
            // Default sanitization for words without stars
            var sanitized = word.replace(/[^\w\s']/g, ''); // Remove non-alphanumeric characters
            sanitized = sanitized.replace(/\'s\b/g, '');   // Remove possessive 's
            return sanitized.trim().toLowerCase();
        }
    }
    
    // Function to add a word to "Words to Practice"
    function addWordToPractice(wordSpan) {
        var originalWord = wordSpan.getAttribute("data-original-word"); // Retrieve original word
        var sanitizedWord = sanitizeWord(originalWord); // Sanitize as before
    
        if (!addedWords.has(sanitizedWord)) {
            addedWords.add(sanitizedWord);
    
            // Add visual feedback
            wordSpan.classList.add("clicked");
    
            // Create the list item
            var listItem = document.createElement("li");
            listItem.textContent = sanitizedWord;
            listItem.classList.add("word-to-practice");
    
            // Add a remove button
            var removeButton = document.createElement("button");
            removeButton.textContent = "X";
            removeButton.classList.add("remove-button");
    
            removeButton.addEventListener("click", function() {
                listItem.remove();
                addedWords.delete(sanitizedWord);
                wordSpan.classList.remove("clicked");
    
                // Hide buttons if no words are left
                if (addedWords.size === 0) {
                    clearButton.style.display = "none";
                    practiceButton.style.display = "none";
                    startText.style.display = "block";

                // Restore the previously hidden sections
                document.querySelector(".story").classList.remove("hidden");
                document.querySelector(".glossary").classList.remove("hidden");
                document.querySelector(".title").classList.remove("hidden");
                }
            });
    
            listItem.appendChild(removeButton);
            document.getElementById("wordList").appendChild(listItem);
    
            // Show buttons and hide start text if it's the first entry
            if (addedWords.size === 1) {
                clearButton.style.display = "block";
                practiceButton.style.display = "block";
                startText.style.display = "none";
            }
        }
    }
    
    function addPhraseToPractice(phrase) {
        // Retrieve the raw term (with stars) from the data attribute
        var phraseText = phrase.getAttribute("data-original-term") || phrase.textContent;
    
        // Remove leading numbers and colons, strip stars, but keep spaces intact
        var cleanPhrase = phraseText.split(":")[0].replace(/^\d+\s*/, '').replace(/\*/g, '').trim();
    
        // Sanitize the cleaned phrase
        var sanitizedPhrase = cleanPhrase.replace(/[^\w\s]/g, '').toLowerCase(); // Remove punctuation, keep spaces
    
        if (!addedWords.has(sanitizedPhrase)) {
            addedWords.add(sanitizedPhrase);
    
            // Add the 'clicked' class for visual effect
            phrase.classList.add("clicked");
    
            // Create a new list item
            var listItem = document.createElement("li");
            listItem.textContent = cleanPhrase; // Render the cleaned phrase
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
                    practiceButton.style.display = "block";
                    startText.style.display = "block";
    
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

    // Hide the Practice button
    practiceButton.style.display = "none";

    // Expand the "Words to Practice" section and hide its border
    const wordsSection = document.querySelector(".words-to-practice");
    wordsSection.classList.add("no-border");
});

