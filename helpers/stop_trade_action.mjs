import * as locator_constants from '../config/locators_constants.mjs';
import * as local_data_constants from '../config/local_data_constant.mjs';
import * as url_constants from '../config/url_constants.mjs';
import * as input_constants from '../config/input_constants.mjs';
import * as data_helper from './chrome_db_helper.mjs';

// Function to read opening balance from funds page
export function readOpeningBalanceFromFundsPage() 
{
  // taking reference of the div that contains opening balance
  const mainOpeningBalanceDiv = document.querySelector(locator_constants.MAIN_OPENING_BALANCE_DIV);

  if (mainOpeningBalanceDiv) 
  {
    // taking of the value of the header in reference div
    const headerText = mainOpeningBalanceDiv.querySelector(locator_constants.HEADER_TEXT_OPENING_BALANCE_DIV).textContent.trim().toLowerCase();

    // checking if the header text contains equity keyword
    if (headerText.includes(locator_constants.HEADER_TEXT_TITLE_OPENING_BALANCE)) 
    {
      const rows = mainOpeningBalanceDiv.querySelectorAll(locator_constants.OPENING_BALANCE_TABLE_ROW);
      let openingBalanceValue;
      rows.forEach(row => 
        {
          const firstTdText = row.querySelector(locator_constants.OPENING_BALANCE_COLUMN_HEADER).textContent.trim();
          if (firstTdText === locator_constants.OPENING_BALANCE) 
          {
            openingBalanceValue = row.querySelector(locator_constants.OPENING_BALANCE_VALUE).textContent.trim();
          }
        });

      // removing comma from the opening Balance Value 
		  openingBalanceValue = openingBalanceValue.replace(/,/g, '');
	    data_helper.saveData(local_data_constants.USER_STOCK_OPENING_BALANCE_KEY, parseFloat(openingBalanceValue))
	    return openingBalanceValue;

    }
  }
}

// read Summary of position Iteratively a summary profit or loss value
export function readSummaryOfPositionIteratively(opening_Bal, current_Bal,stop_loss_percentage, fixed_profit_milestone,next_profit_milestone)
{
  if(opening_Bal && stop_loss_percentage)	
  {	
    var tfootTd = document.querySelector(locator_constants.SUMMARY_POSITION);

    var stop_loss_amount = (parseFloat(stop_loss_percentage)/100)*parseFloat(current_Bal);
    
    var currentPositionSummaryAmount = parseFloat(tfootTd.textContent)
    
    // check current porsition summary amount is less than negated stop_loss_amount
    if (currentPositionSummaryAmount <= (0-stop_loss_amount)) 
    {
      var currentDate = new Date();
      var timestamp = currentDate.toISOString();
      data_helper.saveData(local_data_constants.LOSS_DATE, timestamp)	
	    navigateToUrl(url_constants.TOGGLE_URL);
    }
    else
    {
	    if(currentPositionSummaryAmount>= next_profit_milestone)
	    {
        var amount_to_add=0
        if(current_Bal==opening_Bal)
        {
          amount_to_add=currentPositionSummaryAmount
        }
        else
        {
          amount_to_add=(currentPositionSummaryAmount -(current_Bal-opening_Bal))
        }
		    current_Bal = current_Bal+amount_to_add
		    next_profit_milestone=next_profit_milestone+fixed_profit_milestone
	    }
	    setTimeout(function() 
      {
		    readSummaryOfPositionIteratively(opening_Bal,current_Bal, stop_loss_percentage, fixed_profit_milestone,next_profit_milestone)
		  }, 1000);
    }
  } 
}

// navigate to the given url
export function navigateToUrl(url) 
{
  chrome.runtime.sendMessage({ action: 'navigateToPage', url });
}

// fetch stop loss percentage from th user
export function fetchStopLossPercentageValueForDay()
{
  var currentDate = new Date();
  var timestamp = currentDate.toISOString();
  var today = null
	// Fetch stored data from local storage
  var stop_loss_percentage = null
  data_helper.loadData(local_data_constants.USER_STOP_LOSS_PERCENTAGE, function(Seclore_User_Stock_Loss_Limit) 
  {
		stop_loss_percentage =Seclore_User_Stock_Loss_Limit;

    data_helper.loadData(local_data_constants.USER_DATA_COLLECTION_DATE, function(Seclore_User_Today) 
    {
		  today = Seclore_User_Today;
    if (stop_loss_percentage) 
    {
      var storedDate = new Date(today);
      if (storedDate.toDateString() === currentDate.toDateString()) 
      {
        console.log("Today's input: " + stop_loss_percentage);
      } 
      else 
      {
        var newUserInput = prompt(input_constants.INPUT_STOP_LOSS_PERCENTAGE);
        data_helper.saveData(local_data_constants.USER_STOP_LOSS_PERCENTAGE, newUserInput)
	      data_helper.saveData(local_data_constants.USER_DATA_COLLECTION_DATE,timestamp)
	     }
    } 
    else 
    {
        var newUserInput = prompt(input_constants.INPUT_STOP_LOSS_PERCENTAGE);
        data_helper.saveData(local_data_constants.USER_STOP_LOSS_PERCENTAGE, newUserInput)
	    data_helper.saveData(local_data_constants.USER_DATA_COLLECTION_DATE,timestamp)
    }
    });
  });
}

// compare loss with given stop loss percentage and call kill switch method
export function compareLossAndCallKillSwitch()
{
	setTimeout(function() 
	{	
    data_helper.loadData(local_data_constants.USER_STOCK_OPENING_BALANCE_KEY, function(User_Stock_Opening_Bal) 
    {
		  var opening_Bal = User_Stock_Opening_Bal;
		  console.log('User_Stock_Opening_Bal:', opening_Bal);
      data_helper.loadData(local_data_constants.USER_TRAILING_STOP_LOSS_PERCENTAGE, function(trailing_stop_loss_percentage) 
      {
        console.log('User_Trailing_Stop_Loss_Percentage:', trailing_stop_loss_percentage);
        var fixed_profit_milestone = (parseFloat(trailing_stop_loss_percentage)/100)*parseFloat(opening_Bal); 
        data_helper.loadData(local_data_constants.USER_STOP_LOSS_PERCENTAGE, function(User_Provided_Stop_Loss_Percentage) 
        {
		      var stop_loss_percentage = User_Provided_Stop_Loss_Percentage;
		      console.log('User_Provided_Stop_Loss_Percentage:', stop_loss_percentage);
          readSummaryOfPositionIteratively(opening_Bal, opening_Bal,stop_loss_percentage, fixed_profit_milestone,fixed_profit_milestone);
        })
      })
    })
  
  }, 2000);
}

//switch off the kill switch toggle if on
export function switchOffKillSwitchToggleIfOn() 
{
  var isChange=false
  var toggles = document.querySelectorAll(locator_constants.KILL_SWITCH_TOGGLE);
  toggles.forEach(function(toggle) 
  {
    
    if (toggle.checked) 
    {
      isChange=true
      toggle.checked = false;
    }
    });
    if(isChange)
    {
    setTimeout(function() 
    {
      
      var buttonText = 'Continue';
var buttons = document.querySelectorAll(locator_constants.KILL_CONTINUE_BUTTON);

for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].textContent.trim() === buttonText) {
        buttons[i].click();
        break;
    }
}

      console.log("kill switch clicked")
    }, 2000);

    
    setTimeout(function() {
      var buttonText = 'Continue';
    
var buttons = document.querySelectorAll(locator_constants.KILL_CONTINUE_BUTTON_SUBMIT);

for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].textContent.trim() === buttonText) {
        buttons[i].click();
        console.log("kill switch clicked")
        break;
        
    }
}

      console.log("kill switch clicked")
  }, 2000);
    
    }
}