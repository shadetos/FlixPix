const RAPID_API_KEY = "c4ff79442amsh30e5357ef2a421ep1190ccjsnc0974c03e6f6";

document.addEventListener('DOMContentLoaded', () => {
    const timeButtons = document.querySelectorAll('.time-button');
    const preferenceButtons = document.querySelectorAll('.preference-button');
    const form = document.getElementById('recommendation-form');
    const resultDiv = document.getElementById('result');

    let formData = {
        time: 'Any',
        genre: '',
        preference: 'noPreference',
    };

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
        });
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
            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': RAPID_API_KEY,
                    'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
                },
            };

            const url = 'https://streaming-availability.p.rapidapi.com/v2/search/filters';

            const params = new URLSearchParams({
                country: 'us',
                services: 'netflix',
                type: 'movie',
                order_by: 'rating',
                output_language: 'en',
                show_type: 'movie',
                genre: formData.genre,
                language: 'en',
            });

            // Handle release date preferences
            if (formData.preference === 'before1990') {
                params.set('release_year_max', '1989');
            } else if (formData.preference === '1990s') {
                params.set('release_year_min', '1990');
                params.set('release_year_max', '1999');
            } else if (formData.preference === '2000s') {
                params.set('release_year_min', '2000');
                params.set('release_year_max', '2009');
            } else if (formData.preference === '2010+') {
                params.set('release_year_min', '2010');
            }

            // Handle runtime preferences
            if (formData.time === '90') {
                params.set('max_runtime', '90');
            } else if (formData.time === '120') {
                params.set('min_runtime', '90');
                params.set('max_runtime', '120');
            } else if (formData.time === '180') {
                params.set('min_runtime', '120');
            }

            const response = await fetch(`${url}?${params.toString()}`, options);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            let movies = data.result || [];

            movies = movies.slice(0, 3); // Take top 3 movies

            resultDiv.innerHTML = '';

            if (movies.length > 0) {
                movies.forEach((movie) => {
                    resultDiv.innerHTML += `
                        <div class="my-4 p-4 bg-slate-700 rounded-lg">
                            <h2 class="text-2xl font-bold text-red-400">${movie.title}</h2>
                            <p class="text-gray-200">${movie.overview}</p>
                            <p class="text-yellow-500">⭐ Rating: ${movie.rating / 10}</p>
                        </div>
                    `;
                });
            } else {
                resultDiv.innerHTML = '<p>No recommendations found.</p>';
            }
            resultDiv.classList.remove('hidden');
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            resultDiv.textContent = 'Error fetching recommendations. Please try again later.';
            resultDiv.classList.remove('hidden');
        }
    });
});
