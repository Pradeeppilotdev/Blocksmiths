window.appConfig = {};

fetch('/api/config')
  .then(response => response.json())
  .then(config => {
    window.appConfig = config;
    console.log('Configuration loaded successfully');
    
    const configLoadedEvent = new Event('configLoaded');
    document.dispatchEvent(configLoadedEvent);
  })
  .catch(error => {
    console.error('Failed to load configuration:', error);
  });