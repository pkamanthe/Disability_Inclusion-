document.addEventListener('DOMContentLoaded', () => {
    const challengesSection = document.getElementById('challenges-section');
    let challenges = []; // Store the fetched challenges here

    // Function to fetch challenges from a local API
    const fetchChallenges = () => {
        fetch('http://localhost:3000/challenges')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                challenges = data; // Store the fetched data in the array
                displayChallenges(challenges);
            })
            .catch(error => console.error('There was a problem with the fetch operation:', error));
    };

    // Function to display challenges
    const displayChallenges = (challenges) => {
        challengesSection.innerHTML = ''; // Clear previous challenges

        challenges.forEach(challenge => {
            const challengeCard = document.createElement('div');
            challengeCard.classList.add('challenge-card');

            challengeCard.innerHTML = `
                <h3>${challenge.disability}</h3>
                <img src="${challenge.image_url}" alt="${challenge.disability}" class="challenge-image" style="max-width: 100%; height: auto;" />
                <p id="description-${challenge.id}" style="display: none;">${challenge.description}</p>
                <div class="actions">
                    <button class="like" data-id="${challenge.id}">👍 <span class="like-count">${challenge.likes}</span></button>
                    <button class="dislike" data-id="${challenge.id}">👎 <span class="dislike-count">${challenge.dislikes}</span></button>
                    <button class="reset" data-id="${challenge.id}">🔄 Reset</button>
                </div>
                <div class="comments-section" id="comments-section-${challenge.id}">
                    <h4>Comments:</h4>
                    <ul class="comments-list" id="comments-list-${challenge.id}"></ul>
                    <form class="comment-form" id="comment-form-${challenge.id}">
                        <input type="text" id="comment-${challenge.id}" placeholder="Add a comment..." required>
                        <button type="submit">Comment</button>
                    </form>
                </div>
            `;

            challengesSection.appendChild(challengeCard);

            // Add event listeners for like, dislike, reset, and comments
            challengeCard.querySelector('.like').addEventListener('click', () => handleLike(challengeCard, challenge.id));
            challengeCard.querySelector('.dislike').addEventListener('click', () => handleDislike(challengeCard, challenge.id));
            challengeCard.querySelector('.reset').addEventListener('click', () => resetCounts(challengeCard));
            challengeCard.querySelector(`#comment-form-${challenge.id}`).addEventListener('submit', (event) => {
                event.preventDefault();
                handleComment(challenge.id);
            });
        });
    };

    const handleLike = (challengeCard, id) => {
        const likeCountElement = challengeCard.querySelector('.like-count');
        let currentLikes = parseInt(likeCountElement.textContent);
        currentLikes++;
        likeCountElement.textContent = currentLikes;

        // Update likes in the backend
        updateChallenge(id, { likes: currentLikes });
    };

    const handleDislike = (challengeCard, id) => {
        const dislikeCountElement = challengeCard.querySelector('.dislike-count');
        let currentDislikes = parseInt(dislikeCountElement.textContent);
        currentDislikes++;
        dislikeCountElement.textContent = currentDislikes;

        // Update dislikes in the backend
        updateChallenge(id, { dislikes: currentDislikes });
    };

    const resetCounts = (challengeCard) => {
        const likeCountElement = challengeCard.querySelector('.like-count');
        const dislikeCountElement = challengeCard.querySelector('.dislike-count');

        likeCountElement.textContent = 0;
        dislikeCountElement.textContent = 0;

        // Reset counts in the backend
        const id = challengeCard.querySelector('.like').getAttribute('data-id');
        updateChallenge(id, { likes: 0, dislikes: 0 });
    };

    const handleComment = (id) => {
        const commentInput = document.getElementById(`comment-${id}`);
        const commentText = commentInput.value.trim(); // Get the comment text and trim whitespace

        if (commentText) { // Check if the comment is not empty
            const commentsList = document.getElementById(`comments-list-${id}`);
            const commentItem = document.createElement('li');
            commentItem.textContent = commentText;

            // Create a delete button for the comment
            const deleteCommentButton = document.createElement('button');
            deleteCommentButton.textContent = '🗑️ Delete';
            deleteCommentButton.classList.add('delete-comment');

            // Add event listener to the delete button
            deleteCommentButton.addEventListener('click', () => {
                commentsList.removeChild(commentItem);
            });

            commentItem.appendChild(deleteCommentButton);
            commentsList.appendChild(commentItem);

            commentInput.value = ''; // Clear the input after submission
        }
    };

    const updateChallenge = (id, updatedData) => {
        fetch(`http://localhost:3000/challenges/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => console.log('Challenge updated:', data))
            .catch(error => console.error('Error updating challenge:', error));
    };

    // Handle submission of the challenge form
    const form = document.getElementById('add-challenge-form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const disability = document.getElementById('disability').value;
        const description = document.getElementById('challenge').value;
        const image_url = document.getElementById('image_url').value;

        const newChallenge = {
            disability,
            description,
            image_url,
            likes: 0,
            dislikes: 0
        };

        // Add new challenge to the backend
        fetch('http://localhost:3000/challenges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newChallenge),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                challenges.push(data); // Add the new challenge to the challenges array
                displayChallenges(challenges); // Update the display with the new challenge
                form.reset(); // Reset the form fields
            })
            .catch(error => console.error('Error adding challenge:', error));
    });

    // Initial fetch of challenges
    fetchChallenges();
});