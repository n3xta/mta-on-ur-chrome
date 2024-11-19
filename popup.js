// Ensure the script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Request user's location
    navigator.geolocation.getCurrentPosition(success, error);
  
    function success(position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchTransitData(lat, lon);
    }
  
    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
      // Fallback coordinates (e.g., New York City)
      fetchTransitData(40.7128, -74.0060);
    }
  
    function fetchTransitData(lat, lon) {
      const url = `https://io.zongzechen.com/mtapi/by-location?lat=${lat}&lon=${lon}`;
  
      fetch(url)
        .then(response => response.json())
        .then(data => processTransitData(data))
        .catch(err => {
          console.error('Error fetching transit data:', err);
          document.getElementById('transit-info').textContent = 'Unable to load transit data.';
        });
    }
  
    function processTransitData(data) {
      const transitInfoDiv = document.getElementById('transit-info');
      transitInfoDiv.innerHTML = ''; // Clear previous data
  
      if (!data || !data.data || data.data.length === 0) {
        transitInfoDiv.textContent = 'No transit data available.';
        return;
      }
  
      // For simplicity, we'll use the first station in the data
      const station = data.data[0];
      const stationName = station.name;
      const routes = station.routes.join(', ');
  
      const northbound = station.N && station.N.length ? formatTrainInfo(station.N[0]) : 'No upcoming trains';
      const southbound = station.S && station.S.length ? formatTrainInfo(station.S[0]) : 'No upcoming trains';
  
      const stationDiv = document.createElement('div');
      stationDiv.classList.add('station');
  
      stationDiv.innerHTML = `
        <h3>${stationName} (${routes})</h3>
        <p><strong>Northbound:</strong> ${northbound}</p>
        <p><strong>Southbound:</strong> ${southbound}</p>
      `;
  
      transitInfoDiv.appendChild(stationDiv);
  
      // Fetch and display the fortune cookie
      displayFortuneCookie(stationName, routes);
    }
  
    function formatTrainInfo(train) {
      const time = new Date(train.time);
      const now = new Date();
      const minutesAway = Math.round((time - now) / 60000);
      return `${train.route} train arriving in ${minutesAway} min`;
    }
  
    function displayFortuneCookie(stationName, routes) {
        const fortuneDiv = document.getElementById('fortune-cookie');
      
        // Prepare the prompt for the AI API
        const prompt = `Provide a short, wise, and inspirational message related to transit, commuting, or travel, incorporating the station "${stationName}" and the line(s) "${routes}".`;
      
        // Call the Replicate AI API
        fetch('https://replicate-api-proxy.glitch.me/create_n_get/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: prompt,
            max_tokens: 50,
            temperature: 0.7,
            top_p: 0.95,
            top_k: 50,
            presence_penalty: 0.5,
            frequency_penalty: 0.5
          })
        })
          .then(response => response.json())
          .then(data => {
            if (data && data.output) {
              fortuneDiv.textContent = data.output;
            } else {
              fortuneDiv.textContent = 'Safe travels and have a great day!';
            }
          })
          .catch(err => {
            console.error('Error fetching fortune:', err);
            fortuneDiv.textContent = 'Patience is a virtue, especially when commuting.';
          });
      }      
  });
  