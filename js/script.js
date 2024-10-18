document.addEventListener("DOMContentLoaded", function() {
    var addedWords = new Set();

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
        var words = data.body.split(" "); // Split the story body into individual words
        storyText.innerHTML = ""; // Clear previous content

        words.forEach((word, index) => {
            var wordSpan = document.createElement("span");
            wordSpan.textContent = word;

            // Add a click event listener to each word
            wordSpan.addEventListener("click", function() {
                addWordToPractice(wordSpan);
                wordSpan.classList.add("underlined");
            });

            // Append the word to the story text with a space after it
            storyText.appendChild(wordSpan);
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
            glossaryItem.innerHTML = `<sup class="glossary-ref">${ref}</sup> ${glossary[ref].term}: ${glossary[ref].definition}`;
            glossaryList.appendChild(glossaryItem);

            // Add click event to glossary terms
            glossaryItem.addEventListener("click", function() {
                addPhraseToPractice(glossaryItem);
            });
        });
    }

    // Function to sanitize words
    function sanitizeWord(word) {
        var sanitized = word.replace(/[^\w\s']/g, ''); // Remove non-alphanumeric characters
        sanitized = sanitized.replace(/\'s\b/g, ''); // Remove possessive forms like 's
        return sanitized.trim(); // Trim any extra spaces
    }

// Function to add a word to the "Words to Practice" section
function addWordToPractice(word) {
    var sanitizedWord = sanitizeWord(word.textContent);
    if (!addedWords.has(sanitizedWord)) {
        addedWords.add(sanitizedWord);
        
        // Create a new list item
        var listItem = document.createElement("li");
        listItem.textContent = sanitizedWord;
        listItem.classList.add("word-to-practice"); // Ensure the list item has the correct class

        // Create the remove button
        var removeButton = document.createElement("button");
        removeButton.textContent = "X";
        removeButton.classList.add("remove-button"); // Apply the remove-button class here

        // Event listener to remove the word
        removeButton.addEventListener("click", function() {
            listItem.remove();
            addedWords.delete(sanitizedWord);
            word.classList.remove("underlined");
        });

        // Append the remove button to the list item
        listItem.appendChild(removeButton);
        document.getElementById("wordList").appendChild(listItem);
    }
}

// Function to add a glossary phrase to the "Words to Practice" section
function addPhraseToPractice(phrase) {
    var phraseText = phrase.textContent.split(":")[0].replace(/^\d+\s*/, '').trim();
    var sanitizedPhrase = sanitizeWord(phraseText);
    if (!addedWords.has(sanitizedPhrase)) {
        addedWords.add(sanitizedPhrase);
        
        // Underline the phrase in the glossary
        phrase.innerHTML = phrase.innerHTML.replace(phraseText, "<span class='underlined'>" + phraseText + "</span>");
        
        // Create a new list item
        var listItem = document.createElement("li");
        listItem.textContent = sanitizedPhrase;
        listItem.classList.add("word-to-practice"); // Ensure the list item has the correct class

        // Create the remove button
        var removeButton = document.createElement("button");
        removeButton.textContent = "X";
        removeButton.classList.add("remove-button"); // Apply the remove-button class here

        // Event listener to remove the phrase
        removeButton.addEventListener("click", function() {
            listItem.remove();
            addedWords.delete(sanitizedPhrase);
            
            // Remove underline from all matching glossary phrases
            document.querySelectorAll(".glossary li").forEach(function(item) {
                item.querySelectorAll(".underlined").forEach(function(element) {
                    if (element.textContent.trim() === phraseText) {
                        element.classList.remove("underlined");
                    }
                });
            });
        });

        // Append the remove button to the list item
        listItem.appendChild(removeButton);
        document.getElementById("wordList").appendChild(listItem);
    }
}

    // Clear all words functionality
    var clearButton = document.getElementById("clearButton");
    var startText = document.querySelector(".words-to-practice p");

    clearButton.addEventListener("click", function() {
        document.getElementById("wordList").innerHTML = "";
        addedWords.clear();
        clearButton.style.display = "none";
        startText.style.display = "block";
    });

    clearButton.style.display = "none";
    startText.style.display = "block";
});
