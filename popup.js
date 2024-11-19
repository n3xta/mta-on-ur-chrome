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
  
    async function displayFortuneCookie(stationName, routes) {
        const fortuneDiv = document.getElementById("fortune-cookie");
        fortuneDiv.textContent = "Generating your fortune...";
      
        try {

          const system_prompt = "You are a fortune cookie that provides a short, transit-themed inspirational sentence.";
          const formattedPrompt = `Generate a short, wise fortune for someone traveling near the station "${stationName}" on the line(s) "${routes}".`;
      
          // Data for the proxy API call
          const data = {
            modelURL:
              "https://api.replicate.com/v1/models/meta/meta-llama-3-70b-instruct/predictions",
            input: {
              prompt: formattedPrompt,
              system_prompt: system_prompt,
              max_tokens: 50,
              temperature: 0.7,
              top_p: 0.9,
            },
          };
      
          // Configuration for the fetch request
          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(data),
          };
      
          // Fetch the response from the proxy server
          const proxyURL = "https://replicate-api-proxy.glitch.me/create_n_get/";
          const raw_response = await fetch(proxyURL, options);
      
          // Parse the JSON response
          const json_response = await raw_response.json();
      
          // Update the fortune div with the response or a fallback message
          if (json_response && json_response.output) {
            fortuneDiv.textContent = json_response.output.join("").trim();
          } else {
            fortuneDiv.textContent = "The future is uncertain, but your journey will be great!";
          }
        } catch (error) {
          console.error("Error fetching fortune cookie:", error);
          fortuneDiv.textContent =
            "An error occurred. Even fortune tellers sometimes miss the train.";
        }
      }
      
  });
  