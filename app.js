//BUDGET CONTROLLER

let budgetController = (function(){

    let Expenses = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expenses.prototype.calculatePercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round( ( this.value / totalIncome ) * 100 );
        } else {
            this.percentage = -1;
        }
    };

    Expenses.prototype.getPercentage = function() {
        return this.percentage;
    };

    let Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //Create our data structure to store all the data we will be collecting and also take from the data to display
    //in the UI
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
    }

    let calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };


    return {

        addItems: function(type, des, val){
            let newItem, ID;

            //Create unique id by adding 1 to the id of the last element in the inc or exp array
            //But since its dependent on the initial id of the first element in the array, we create
            //an if statement to set the first id to 0 and the others by adding 1 to the last element before it
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }

            //Create expenses or income object based on the type i.e 'inc' or 'exp' using the function constructor
            if(type === 'exp'){
                newItem = new Expenses(ID, des, val);
            }
            else{
                newItem = new Income(ID, des, val);
            }

            //Store the newItem inside our data structure
            data.allItems[type].push(newItem);

            //Return the newItem so we'll be able to use the addItems method to create an item. 
            //If we don't return it then the addItems method will be useless because its not returning anything
            return newItem;

        },

        deleteItems: function(type, id) {
            let ids, index;

            //map array method loops through an array and returns something in a new array unlike forEach which doesn't
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            //this gets the index of the id we want to delete
            index = ids.indexOf(id);

            //splice deletes something from a position(index in this case) and the number determines how many 
            //elements to delete from the index (1 in this case)
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: inc - exp
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round( (data.totals.exp / data.totals.inc) * 100 );
            }
            else {
                data.percentage = -1;
            }
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },

        calcPercentage: function() {
            data.allItems.exp.forEach(function(current) {
                current.calculatePercentage(data.totals.inc);
            });
        },

        getExpensePercentage: function() {
            let allPercentage = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });

            return allPercentage;
        },

        test: function() {
            console.log(data);
        }


    }





})();



//UI CONTROLLER
let UIController = (function(){

    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercentLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    let formattedNumber = function(num, type) {
        let splitNum, integerNum, decimalNum, sign;

        num = Math.abs(num);
        //Convert the num to two decimal place. PS: toFixed() returns a string
        num = num.toFixed(2);

        //Split the num to the integer part and the decimal part. ps split() splits the string into an array
        splitNum = num.split('.');
        integerNum = splitNum[0];
        decimalNum = splitNum[1];

        if (integerNum.length > 3) {
            integerNum = integerNum.substr(0, integerNum.length - 3) + ',' + integerNum.substr(integerNum.length - 3, 3);
        }

        //return (type === 'exp' ? '-' : '+') + ' ' + integerNum + '.' + decimalNum;
        if (type === 'exp') {
            sign = '-';
        } else {
            sign = '+';
        }

        return sign + ' ' + integerNum + '.' + decimalNum;

    };

    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value, //either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
            
        },

        addListItems: function(obj, type) {
            //Declaring the variables to be used
            let html, newHtml, element;

            //Create html element with placeholder text surrounded by % e.g  %id%
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">btn</i></button></div></div></div>';
            }
            else if(type === 'exp') {
                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">btn</i></button></div></div></div>'
            }

            //Replace placholder text with real actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formattedNumber(obj.value, type) );

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: function(selectorID) {
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        displayYear: function() {
            let now, year, month, months;

            now = new Date();
            year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            //This getMonth() returns the index number of the month and its zero based so 7 means june
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        displayBudget: function(obj) {
            let type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formattedNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formattedNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formattedNumber(obj.totalExpenses, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        /*My way of resetting the displays to zero on refresh
        clearDisplayBudget: function() {
            document.querySelector(DOMstrings.budgetLabel).textContent = 0;
            document.querySelector(DOMstrings.incomeLabel).textContent = 0;
            document.querySelector(DOMstrings.expensesLabel).textContent = 0;
            document.querySelector(DOMstrings.percentageLabel).textContent = 0 + '%';
        },
        */

        displayExpensePercent: function(percentages) {
            //This querySelectorAll returns a nodeList which does not have most of the array methods so we can't use the forEach loop to iterate
            //over it so we create a function that takes the nodeList and a callback function as a parameter and uses a for loop to iterate
            //over the nodelist and and call a function on each of them which is similar to what a forEach loop will do
            let fields = document.querySelectorAll(DOMstrings.expensePercentLabel); 

            //Reusable function to iterate and use a function on a nodelist
            let nodeListForEach = function(nodeList, callBackFunction) {
                for (let i = 0; i < nodeList.length; i++) {
                    callBackFunction(nodeList[i], i);                    
                }
            }

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
            });

        },

        clearFields: function() {
            let fields, fieldsArr;

            fields = document.querySelectorAll(`${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`);

            //Convert list gotten from the querySelectorAll to an array
            fieldsArr = Array.prototype.slice.call(fields);

            //Loop over the fieldsArr with forEach method
            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });

            //Focus the description input again
            fieldsArr[0].focus();
        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    };
    

})();




//GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, UICtrl){
    
    let setUpEventListeners = function (){
        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    let updateBudget = function() {
        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return budget
        let budget = budgetCtrl.getBudget();

        //3. Display the budget in the UI
        UICtrl.displayBudget(budget);       
    };
    
    let updatePercentage = function() {
        //Calculate percentage
        budgetCtrl.calcPercentage();

        //Return percentage
        let percentages = budgetCtrl.getExpensePercentage();

        //Display percentage in the UI
        UICtrl.displayExpensePercent(percentages);
    };

    let ctrlAddItem = function(){
        //1. Get the filled input value and storing it in the input variable
        let input = UICtrl.getInput();
        
        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
            //2. Add the item to the budget controller which is basically the object created and storing it the newItem variable
            let newItem = budgetCtrl.addItems(input.type, input.description, input.value);

            //3. Add the item to the UI
            UICtrl.addListItems(newItem, input.type);

            //4. Clear fields
            UICtrl.clearFields();

            //5. Update and Calculate the budget
            updateBudget();
            
            //4. Update percent
            updatePercentage();
        }  
    };

    let ctrlDeleteItem = function(event) {
        let itemID, splitID, ID, type;

        //split method takes a parameter which is the point at which we want to separate the string and whatever is
        //before and after the parameter will be put at different indexes in a new array
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete item from the data structure
            budgetCtrl.deleteItems(type, ID);
            //2. Delete item from the UI
            UICtrl.deleteListItem(itemID);
            //3. Update and show the new budget
            updateBudget();

            //4. Update percent
            updatePercentage();
        }
        
    }

    return {
        init: function(){
            console.log('APPLICATION HAS STARTED');
            setUpEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            //UICtrl.clearDisplayBudget();

            UICtrl.displayYear();
        }
    };
    

})(budgetController, UIController);

controller.init();