const budgetController = (function() {
  
  const Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  const Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(el => {
      sum += el.value;
    });
    data.totals[type] = sum;
  };

  let data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      let newItem, ID;

      //create ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1; //ID = last ID + 1;
      } else {
        ID = 0;
      }
      

      //create new item based on 'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }
      //push into data structure
      data.allItems[type].push(newItem);
      //return new ID
      return newItem;
      
    },
    deleteItem: function(type, id) {
      let ids, index;
      //select item not based on data.allItems[type][ID] but instead based on value equals to...
      //find index of ID by recreating array
      ids = data.allItems[type].map(i => {
        return i.id;
      })
      index = ids.indexOf(id);
      //remove the item in the array with index of index
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function() {

      //calculate income & expenses
      calculateTotal('inc');
      calculateTotal('exp');
      //calculate budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      //calculate percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: function() {
      data.allItems.exp.forEach(el => {
        el.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function() {
      let allPerc = data.allItems.exp.map(el => {
        return el.getPercentage();
      })
      return allPerc;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },
    testing: function() {
      console.log(data);
    }
  }
})();

const UIController = (function() {
  const DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container.clearfix",
    expensesPercLabel: ".item__percentage",
    dataLabel: '.budget__title--month'

  };
  const formatNumber = function(num, type) {
    let numSplit, int, dec;
    // + or - before number
    //exactly 2 decimal points
    //comma seperating the thousands

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];
    
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input 2310, output 2,310
    } 
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };
  const nodeListForEach = function(list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };
  //public method to get accessed by other modules
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItem: function(obj, type) {
      let html, newHtml, element;
      // 1. create html string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%21%%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }
      // 2. replace placeholder text with data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      // 3. insert html into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },
    deleteListItem: function(selectorID) {
      let el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },
    clearFields: function() {
      let fields, fieldsArray;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      fieldsArray = Array.prototype.slice.call(fields);
      fieldsArray.forEach(el => {
        el.value = "";
      });

      fieldsArray[0].focus();
    },
    displayBudget: function(obj) {
      let type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
      
    },
    displayPercentages: function(percentages) {
      let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
      
      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },
    displayDate: function() {
      let now, year, month, months;
      //
      now = new Date();
      //get the year
      year = now.getFullYear();
      //get the month
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      //set UI
      return document.querySelector(DOMstrings.dataLabel).textContent = months[month] + ', ' + year;
    },
    changeType: function() {
      let fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + 
      DOMstrings.inputValue);

      nodeListForEach(fields, function(current) {
        current.classList.toggle('red-focus');
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };

})();

const appController = (function(budgetCtrl, UICtrl) {
  const setupEventListeners = function() {
    const DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', crtlAddItem);

    document.addEventListener('keypress', function(e) {
      if (e.keyCode === 13 || e.which === 13) {
        crtlAddItem();
      }
    })

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
  }

  const updateBudget = function() {
    // calculate the budget
    budgetCtrl.calculateBudget();
    // return the budget
    let budget = budgetCtrl.getBudget();
    // display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  const updatePercentages = function() {
    // Calculate Percentages
    budgetCtrl.calculatePercentages();
    //Read from the budget controller
    let percentages = budgetCtrl.getPercentages();
    //Update the UI with new percentages
    UICtrl.displayPercentages(percentages);
  }

  const crtlAddItem = function() {
    let input, newItem;

    //get input data
    input = UIController.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //add item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      //add the new item to the interface
      UICtrl.addListItem(newItem, input.type);

      //clear the fields
      UICtrl.clearFields();

      // calculate and update budget
      updateBudget();

      //calculate and display percentages
      updatePercentages();
    }
    
  };

  const ctrlDeleteItem = function(e) {
    let itemID, splitID, type, ID;
    //get the id of the item's div
    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      //inc-1 split method to seperate type and id
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
      //delete item from data structure
      budgetCtrl.deleteItem(type, ID);
      //delete item from UI
      UICtrl.deleteListItem(itemID);
      //update and show new budget
      updateBudget();
      //calculate and display percentages
      updatePercentages();

    } else {
      console.log('failed');
    }
  }

  return {
    init: function() {
      console.log('Application has started');
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
      UICtrl.displayDate();
    }
  };

})(budgetController, UIController);

//
appController.init();

