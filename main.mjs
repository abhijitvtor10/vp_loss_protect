import * as url_constants from './config/url_constants.mjs';
import * as kill_switch_helper from './helpers/stop_trade_action.mjs'
import * as local_data_constants from './config/local_data_constant.mjs';
import * as data_helper from './helpers/chrome_db_helper.mjs'
// Perform actions based on the URL
const currentPageUrl = window.location.href;

if(currentPageUrl.includes(url_constants.ZERODHA_BASE_URL))
{
  kill_switch_helper.fetchStopLossPercentageValueForDay()
}

if (currentPageUrl.includes(url_constants.ZERODHA_FUNDS_URL)) 
{
	setTimeout(function() 
  {
    kill_switch_helper.readOpeningBalanceFromFundsPage()

    // Navigate to positions page
    kill_switch_helper.navigateToUrl(url_constants.ZERODHA_POSITIONS_URL);

	}, 2000);
}

if(currentPageUrl.includes(url_constants.ZERODHA_POSITIONS_URL) && !currentPageUrl.includes(url_constants.ZERODHA_POSITIONS_EXIT_URL))
{
  kill_switch_helper.compareLossAndCallKillSwitch()
}

if(currentPageUrl == url_constants.TOGGLE_URL)
{
	setTimeout(function() 
	{
    var currentDate = new Date();
    data_helper.loadData(local_data_constants.LOSS_DATE, function(Loss_Date) {
      var loss_date = Loss_Date;
      if(loss_date!=null)
      {
        var storedDate = new Date(loss_date);
      if (storedDate.toDateString() === currentDate.toDateString()) 
      {
        console.log("Today's input: " + storedDate);
        kill_switch_helper.switchOffKillSwitchToggleIfOn()   
      } 
      }
      
    });
            
    

	}, 3000);
}

if(currentPageUrl == url_constants.ZERODHA_POSITIONS_EXIT_URL)
{
	setTimeout(function() 
	{
    var currentDate = new Date();
    data_helper.loadData(local_data_constants.LOSS_DATE, function(Loss_Date) {
      var loss_date = Loss_Date;
      if(loss_date!=null)
      {
        var storedDate = new Date(loss_date);
      if (storedDate.toDateString() === currentDate.toDateString()) 
      {
        console.log("Today's input: " + storedDate);
        kill_switch_helper.marketExit()   
      } 
      }
      
    });
            
    

	}, 2000);
}

	

