document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '89fd4c595739cc9d4e289e22d5f6d217'; // Your TMDb API key

    const timeButtons = document.querySelectorAll('.time-button');
    const preferenceButtons = document.querySelectorAll('.preference-button');
    const form = document.getElementById('recommendation-form');
    const resultDiv = document.getElementById('result');

    let formData = {
        time: 'Any',
        genre: '',
        preference: 'noPreference',
    };

    // Function to save preferences to localStorage
    function savePreferences() {
        localStorage.setItem('flixpixPreferences', JSON.stringify(formData));
    }

    // Function to load preferences from localStorage
    function loadPreferences() {
        const storedPreferences = localStorage.getItem('flixpixPreferences');
        if (storedPreferences) {
            formData = JSON.parse(storedPreferences);

            // Pre-select time preference
            if (formData.time) {
                const timeButton = document.querySelector(`.time-button[data-value="${formData.time}"]`);
                if (timeButton) {
                    timeButtons.forEach((btn) => {
                        btn.classList.remove('bg-red-600', 'text-white');
                        btn.classList.add('bg-slate-600', 'text-gray-200');
                    });
                    timeButton.classList.remove('bg-slate-600', 'text-gray-200');
                    timeButton.classList.add('bg-red-600', 'text-white');
                }
            }

            // Pre-select genre
            if (formData.genre) {
                const genreSelect = document.getElementById('genre');
                genreSelect.value = formData.genre;
            }

            // Pre-select release date preference
            if (formData.preference) {
                const preferenceButton = document.querySelector(`.preference-button[data-value="${formData.preference}"]`);
                if (preferenceButton) {
                    preferenceButtons.forEach((btn) => {
                        btn.classList.remove('bg-red-600', 'text-white');
                        btn.classList.add('bg-slate-600', 'text-gray-200');
                    });
                    preferenceButton.classList.remove('bg-slate-600', 'text-gray-200');
                    preferenceButton.classList.add('bg-red-600', 'text-white');
                }
            }
        }
    }

    // Function to save recommendations to localStorage
    function saveRecommendations(movies) {
        localStorage.setItem('flixpixRecommendations', JSON.stringify(movies));
    }

    // Function to load and display recommendations from localStorage
    function loadRecommendations() {
        const storedMovies = localStorage.getItem('flixpixRecommendations');
        if (storedMovies) {
            const movies = JSON.parse(storedMovies);
            displayRecommendations(movies);
        }
    }

    // Function to display recommendations
    function displayRecommendations(movies) {
        resultDiv.innerHTML = '';

        if (movies.length > 0) {
            movies.forEach((movie) => {
                // Handle rating
                const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

                // Get poster image
                const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';

                // Get release year
                const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';

                resultDiv.innerHTML += `
                    <div class="my-4 p-4 bg-slate-700 rounded-lg flex flex-col items-center relative">
                        <!-- Streaming Icon at Top Right -->
                        <i class="fas fa-film absolute top-2 right-2 text-red-600 text-2xl"></i>
                        ${posterPath ? `<img src="${posterPath}" alt="${movie.title} Poster" class="mb-4 w-64 rounded">` : ''}
                        <h2 class="text-2xl font-bold text-red-400 text-center">${movie.title} (${releaseYear})</h2>
                        <p class="text-gray-200 mt-2 text-center">${movie.overview}</p>
                        <p class="text-yellow-500 mt-2">⭐ Rating: ${rating}</p>
                    </div>
                `;
            });
            resultDiv.classList.remove('hidden');
        } else {
            resultDiv.innerHTML = '<p>No recommendations found.</p>';
            resultDiv.classList.remove('hidden');
        }
    }

    // Load preferences and recommendations on page load
    loadPreferences();
    loadRecommendations();

    // Handle time button clicks
    timeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            timeButtons.forEach((btn) => {
                btn.classList.remove('bg-red-600', 'text-white');
                btn.classList.add('bg-slate-600', 'text-gray-200');
            });
            button.classList.remove('bg-slate-600', 'text-gray-200');
            button.classList.add('bg-red-600', 'text-white');
            formData.time = button.getAttribute('data-value');
            savePreferences(); // Save updated preferences
        });
    });

    // Handle preference button clicks
    preferenceButtons.forEach((button) => {
        button.addEventListener('click', () => {
            preferenceButtons.forEach((btn) => {
                btn.classList.remove('bg-red-600', 'text-white');
                btn.classList.add('bg-slate-600', 'text-gray-200');
            });
            button.classList.remove('bg-slate-600', 'text-gray-200');
            button.classList.add('bg-red-600', 'text-white');
            formData.preference = button.getAttribute('data-value');
            savePreferences(); // Save updated preferences
        });
    });

    // Handle genre selection change
    const genreSelect = document.getElementById('genre');
    genreSelect.addEventListener('change', () => {
        formData.genre = genreSelect.value;
        savePreferences(); // Save updated preferences
    });

    // Handle form submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        formData.genre = document.getElementById('genre').value;

        if (!formData.genre) {
            alert('Please select a genre.');
            return;
        }

        try {
            let genreId = getGenreId(formData.genre);
            let url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=1000&language=en-US&include_adult=false`;

            // Handle release date preferences
            if (formData.preference === 'before1990') {
                url += '&primary_release_date.lte=1989-12-31';
            } else if (formData.preference === '1990s') {
                url += '&primary_release_date.gte=1990-01-01&primary_release_date.lte=1999-12-31';
            } else if (formData.preference === '2000s') {
                url += '&primary_release_date.gte=2000-01-01&primary_release_date.lte=2009-12-31';
            } else if (formData.preference === '2010+') {
                url += '&primary_release_date.gte=2010-01-01';
            }

            // Handle runtime preferences
            if (formData.time === '90') {
                url += '&with_runtime.lte=90';
            } else if (formData.time === '120') {
                url += '&with_runtime.gte=90&with_runtime.lte=120';
            } else if (formData.time === '180') {
                url += '&with_runtime.gte=120';
            }

            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                },
            };

            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            let movies = data.results.slice(0, 3); // Take top 3 movies

            // Save recommendations to localStorage
            saveRecommendations(movies);

            // Display recommendations
            displayRecommendations(movies);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            resultDiv.textContent = 'Error fetching recommendations. Please try again later.';
            resultDiv.classList.remove('hidden');
        }
    });

    function getGenreId(genreName) {
        const genres = {
            'Action': 28,
            'Adventure': 12,
            'Animation': 16,
            'Comedy': 35,
            'Crime': 80,
            'Documentary': 99,
            'Drama': 18,
            'Family': 10751,
            'Fantasy': 14,
            'History': 36,
            'Horror': 27,
            'Music': 10402,
            'Mystery': 9648,
            'Romance': 10749,
            'Science Fiction': 878,
            'TV Movie': 10770,
            'Thriller': 53,
            'War': 10752,
            'Western': 37
        };
        return genres[genreName] || '';
    }
});
