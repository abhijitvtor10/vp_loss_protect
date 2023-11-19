// Store data to the chrome common local storage for browser
export function saveData(key, value) 
{
    var data = {};
    data[key] = value;
    chrome.storage.local.set(data, function() 
    {
    console.log('Data saved:', data);
    });
}
          
// Retrieve data from the chrome common local storage for browser
export function loadData(key, callback) 
{
    chrome.storage.local.get(key, function(result) {
    console.log('Data loaded:', result);
    if (callback) 
    {
        callback(result[key]);
    }
    });
}