import * as locator_constants from '../config/locators_constants.mjs';
import * as local_data_constants from '../config/local_data_constant.mjs';
import * as url_constants from '../config/url_constants.mjs';
import * as input_constants from '../config/input_constants.mjs';
import * as data_helper from './chrome_db_helper.mjs';

export function getElement(time_in_seconds, selector) {
  var startTime = Date.now();
  var endTime = startTime + time_in_seconds * 1000;
  var element;

  function checkElement() {
    try {
      element = document.querySelector(selector);
    } catch (error) {
      if (Date.now() < endTime) {

        setTimeout(checkElement, 1000);
      }
    }
  }

  checkElement();
  return element;
}

export function getElements(time_in_seconds, selector) {
  var startTime = Date.now();
  var endTime = startTime + time_in_seconds * 1000;
  var element;

  function checkElements() {
    try {
      element = document.querySelectorAll(selector);
    } catch (error) {
      if (Date.now() < endTime) {

        setTimeout(checkElements, 1000);
      }
    }
  }

  checkElements();
  return element;
}

// Function to read opening balance from funds page
export function readOpeningBalanceFromFundsPage() {
  // taking reference of the div that contains opening balance
  const mainOpeningBalanceDiv = document.querySelector(locator_constants.MAIN_OPENING_BALANCE_DIV);

  if (mainOpeningBalanceDiv) {
    // taking of the value of the header in reference div
    const headerText = mainOpeningBalanceDiv.querySelector(locator_constants.HEADER_TEXT_OPENING_BALANCE_DIV).textContent.trim().toLowerCase();

    // checking if the header text contains equity keyword
    if (headerText.includes(locator_constants.HEADER_TEXT_TITLE_OPENING_BALANCE)) {
      const rows = mainOpeningBalanceDiv.querySelectorAll(locator_constants.OPENING_BALANCE_TABLE_ROW);
      var openingBalanceValue;
      rows.forEach(row => {
        const firstTdText = row.querySelector(locator_constants.OPENING_BALANCE_COLUMN_HEADER).textContent.trim();
        if (firstTdText === locator_constants.OPENING_BALANCE) {
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
var is_stop_loss_updated = false
// read Summary of position Iteratively a summary profit or loss value
export function readSummaryOfPositionIteratively(opening_Bal, current_Bal, stop_loss_percentage, fixed_profit_milestone, next_profit_milestone) 
{
  try
  {
  if (opening_Bal && stop_loss_percentage) {
    var tfootTd = document.querySelector(locator_constants.SUMMARY_POSITION);
    var tfootTd_text= tfootTd.textContent
    console.log("Obtained text from  position "+tfootTd_text)

    tfootTd_text=tfootTd_text.replaceAll(",","")
    

    var stop_loss_amount = (parseFloat(stop_loss_percentage) / 100) * parseFloat(current_Bal);
    if (is_stop_loss_updated) 
    {
      var minimum_closing_balance = (parseFloat((100 - stop_loss_percentage)) / 100) * parseFloat(current_Bal);
      var currentDate = new Date();
      var timestamp = currentDate.toISOString();
      console.log("Current time : " + timestamp)
      console.log("Current Stop loss amount : " + stop_loss_amount)  
      console.log("minimum profit : " + (minimum_closing_balance-opening_Bal))
      console.log("Current balance : " + current_Bal)
      is_stop_loss_updated = false
    }


    var currentPositionSummaryAmount = parseFloat(tfootTd_text)

     
    console.log("Opening balance : "+opening_Bal)
    console.log(" currentPositionSummaryAmount : "+currentPositionSummaryAmount)
    var minimum_closing_balance = (parseFloat((100 - stop_loss_percentage)) / 100) * parseFloat(current_Bal);
    console.log("minimum profit : "  + (minimum_closing_balance-opening_Bal))
    console.log("current_Bal : "+current_Bal)
    console.log(" stop_loss_amount : "+stop_loss_amount)
    console.log(" comparison "+((opening_Bal+currentPositionSummaryAmount) <= (current_Bal-stop_loss_amount)))
    console.log("=======================================================") 
    

    // check current porsition summary amount is less than negated stop_loss_amount
    if ((opening_Bal + currentPositionSummaryAmount) <= (current_Bal - stop_loss_amount)) 
    {
      console.log("stop loss hit you are saved enjoy!")
      console.log("Opening balance : " + opening_Bal)
      console.log(" currentPositionSummaryAmount : " + currentPositionSummaryAmount)
      console.log("current_Bal : " + current_Bal)
      console.log(" stop_loss_amount : " + stop_loss_amount)
      var currentDate = new Date();
      var timestamp = currentDate.toISOString();
      data_helper.saveData(local_data_constants.LOSS_DATE, timestamp)
      navigateToUrl(url_constants.TOGGLE_URL);
     
    }
    else 
    { 
      if (currentPositionSummaryAmount >= next_profit_milestone) {
        var amount_to_add = 0
        if (current_Bal == opening_Bal) {
          amount_to_add = currentPositionSummaryAmount
        }
        else {
          amount_to_add = (currentPositionSummaryAmount - (current_Bal - opening_Bal))
        }
        current_Bal = current_Bal + amount_to_add
        stop_loss_amount = stop_loss_amount + amount_to_add
        is_stop_loss_updated = true

        next_profit_milestone = next_profit_milestone + fixed_profit_milestone
      }
      setTimeout(function () {
        readSummaryOfPositionIteratively(opening_Bal, current_Bal, stop_loss_percentage, fixed_profit_milestone, next_profit_milestone)
      }, 1000);
    }
  }
}
catch(e) 
{
  console.log("Got error while iterating on the positions re-iterating again",e)
  setTimeout(function () {
    readSummaryOfPositionIteratively(opening_Bal, current_Bal, stop_loss_percentage, fixed_profit_milestone, next_profit_milestone)
  }, 2000);
}
}

// navigate to the given url
export function navigateToUrl(url) {
  chrome.runtime.sendMessage({ action: 'navigateToPage', url });
}

// fetch stop loss percentage from th user
export function fetchStopLossPercentageValueForDay() {
  var currentDate = new Date();
  var timestamp = currentDate.toISOString();
  var today = null
  // Fetch stored data from local storage
  var stop_loss_percentage = null
  data_helper.loadData(local_data_constants.USER_STOP_LOSS_PERCENTAGE, function (Seclore_User_Stock_Loss_Limit) {
    stop_loss_percentage = Seclore_User_Stock_Loss_Limit;

    data_helper.loadData(local_data_constants.USER_DATA_COLLECTION_DATE, function (Seclore_User_Today) {
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
          data_helper.saveData(local_data_constants.USER_DATA_COLLECTION_DATE, timestamp)
        }
      }
      else {
        var newUserInput = prompt(input_constants.INPUT_STOP_LOSS_PERCENTAGE);
        data_helper.saveData(local_data_constants.USER_STOP_LOSS_PERCENTAGE, newUserInput)
        data_helper.saveData(local_data_constants.USER_DATA_COLLECTION_DATE, timestamp)
      }
    });
  });
}

// compare loss with given stop loss percentage and call kill switch method
export function compareLossAndCallKillSwitch() {
  setTimeout(function () {
    data_helper.loadData(local_data_constants.USER_STOCK_OPENING_BALANCE_KEY, function (User_Stock_Opening_Bal) {
      var opening_Bal = User_Stock_Opening_Bal;
      console.log('User_Stock_Opening_Bal:', opening_Bal);
      data_helper.loadData(local_data_constants.USER_TRAILING_STOP_LOSS_PERCENTAGE, function (trailing_stop_loss_percentage) {
        console.log('User_Trailing_Stop_Loss_Percentage:', trailing_stop_loss_percentage);
        var fixed_profit_milestone = (parseFloat(trailing_stop_loss_percentage) / 100) * parseFloat(opening_Bal);
        data_helper.loadData(local_data_constants.USER_STOP_LOSS_PERCENTAGE, function (User_Provided_Stop_Loss_Percentage) {
          var stop_loss_percentage = User_Provided_Stop_Loss_Percentage;
          console.log('User_Provided_Stop_Loss_Percentage:', stop_loss_percentage);
          readSummaryOfPositionIteratively(opening_Bal, opening_Bal, stop_loss_percentage, fixed_profit_milestone, fixed_profit_milestone);
        })
      })
    })

  }, 2000);
}

//switch off the kill switch toggle if on
export function switchOffKillSwitchToggleIfOn() {
  var isChange = false
  var toggles = getElements(30, locator_constants.KILL_SWITCH_TOGGLE);
  toggles.forEach(function (toggle) {

    if (toggle.checked) {
      isChange = true
      toggle.checked = false;
    }
  });
  if (isChange) {
    setTimeout(function () {

      var buttonText = 'Continue';
      var buttons = document.querySelectorAll(locator_constants.KILL_CONTINUE_BUTTON);

      for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].textContent.trim() === buttonText) {
          buttons[i].click();
          break;
        }
      }

      console.log("kill switch clicked")
    }, 5000);


    setTimeout(function () {
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
      navigateToUrl(url_constants.ZERODHA_POSITIONS_EXIT_URL);
    }, 5000);

  }
}

export function marketExit() {

  // Get all rows in the table body
  var rows = document.querySelectorAll(locator_constants.DATA_TABLE_SUMMARY);

  try {
    // Iterate through each row
    rows.forEach(function (row) {
      // Get the P&L value for the current row
      //var pnlValue = parseFloat(row.querySelector(locator_constants.PROFIT_LOSS_VALUE).innerText);
        // Select the checkbox
        row.querySelector(locator_constants.MARKET_CHECK_BOX).click();
      
    });
  }
  catch {
    console.log("ignored error while clicking on the check boxes")
  }
  setTimeout(function () {
    // Click the exit button
    document.querySelector(locator_constants.MARKET_EXIT_BUTTON).click();
    setTimeout(function () {
      // Click the exit button confirmation
      document.querySelector(locator_constants.MARKET_EXIT_CONFIRMATION_MODEL).querySelector(locator_constants.MARKET_EXIT_CONFIRMATION_BUTTON).click();
    }, 2000);

  }, 2000);
}