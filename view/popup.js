import * as local_data from '../config/local_data_constant.mjs' 
import * as locators_constants from '../config/locators_constants.mjs'
import * as url_constants from '../config/url_constants.mjs'
import * as data_helper from '../helpers/chrome_db_helper.mjs'
window.onload = function () {
document.getElementById(locators_constants.UPDATE_BUTTON).addEventListener("click", updateValues);
}
// stop_loss_percentage to stop loss percentage

var openingBalance = null
	 var stop_loss_percentage = null

// Retrieve values from local storage
data_helper.loadData(local_data.USER_STOCK_OPENING_BALANCE_KEY, function(User_Stock_Opening_Bal) {
		openingBalance = User_Stock_Opening_Bal;
		document.getElementById(locators_constants.OPENING_BALANCE_ID).value = parseFloat(openingBalance);
		console.log('Seclore_User_Stock_Opening_Bal:', Seclore_User_Stock_Opening_Bal);
});

data_helper.loadData(local_data.USER_STOP_LOSS_PERCENTAGE, function(User_Provided_Stop_Loss_Percentage) {
		stop_loss_percentage =User_Provided_Stop_Loss_Percentage;
		document.getElementById(locators_constants.STOP_LOSS_ID).value = parseFloat(stop_loss_percentage);
		console.log('User_Provided_Stop_Loss_Percentage:', User_Provided_Stop_Loss_Percentage);
});

data_helper.loadData(local_data.USER_TRAILING_STOP_LOSS_PERCENTAGE, function(User_Provided_Trailing_Stop_Loss_Percentage) {
  trailing_stop_loss_percentage = User_Provided_Trailing_Stop_Loss_Percentage;
  document.getElementById(locators_constants.TRAILING_STOP_LOSS_ID).value = parseFloat(trailing_stop_loss_percentage);
  console.log('User_Provided_Trailing_Stop_Loss_Percentage:', trailing_stop_loss_percentage);
});
        

// Update values function
function updateValues() 
{
  // Update local storage
	data_helper.saveData(local_data.USER_STOCK_OPENING_BALANCE_KEY, document.getElementById(locators_constants.OPENING_BALANCE_ID).value)
	data_helper.saveData(local_data.USER_STOP_LOSS_PERCENTAGE, document.getElementById(locators_constants.STOP_LOSS_ID).value)
	data_helper.saveData(local_data.USER_TRAILING_STOP_LOSS_PERCENTAGE, document.getElementById(locators_constants.TRAILING_STOP_LOSS_ID).value)
  window.open(url_constants.ZERODHA_FUNDS_URL, '_blank');
			
}
		
