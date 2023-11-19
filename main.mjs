import * as url_constants from './config/url_constants.mjs';
import * as kill_switch_helper from './helpers/stop_trade_action.mjs'

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

if(currentPageUrl.includes(url_constants.ZERODHA_POSITIONS_URL))
{
  kill_switch_helper.compareLossAndCallKillSwitch()
}

if(currentPageUrl.includes(url_constants.TOGGLE_URL))
{
	setTimeout(function() 
	{

    kill_switch_helper.switchOffKillSwitchToggleIfOn()

	}, 2000);
}


	

