// BUDGET CONTROLLER:
var budgetController = (function(){

    var Expense = function(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1; // quand quelquechose n'est pas définie, on utilise -1
    };

    // Fonction qui calcule le pourcentage pour chaque dépense:
    Expense.prototype.calcPercentage = function(totalIncome){
      if(totalIncome > 0){
        this.percentage = Math.round((this.value / totalIncome) * 100); // math.round pour avoir un integer pourcentage value
      } else { // si totalIncome = 0
        this.percentage = -1;
      }
    };

    // Fonction retournant le pourcentage:
    Expense.prototype.getPercentage = function(){
      return this.percentage;
    };

    var Income = function(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
    };

    var calculateTotal = function(type){
      var sum = 0;
      data.allItems[type].forEach(function(cur){ // type est soit var Expense ou soit var Income ; cur pour  current
          sum = sum + cur.value; // sum est égale à 0 au départ.     OU  sum += cur.value
                                //  Puis imaginons un array avec les sommes suivantes :[200, 400, 100]: les sommes sont les VALUE
                                //quand on va boucler dessus : à la 1ère itération, on obtient sum = 0 + 200
                                // Puis à la prochaine itération: sum = 200 + 400
                                // Puis sum = 600 + 100 = 700 etc...
      });
      data.totals[type] = sum;
    }

    var data = {
      allItems: {
        exp: [],
        inc: []
      },
      totals:{
        exp: 0,
        inc: 0
      },
      budget: 0,
      percentage: -1
    };
    return {
      addItem: function(type, des, val){ // type, description, value
        var newItem, ID;

        // Creation new ID:
        // [1 2 3 4 5], next ID = 6
        // [1 2 4 6 8], next ID = 9
        // ID = last ID + 1
        if(data.allItems[type].length > 0){
          ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
          ID = 0;
        }

        // Création new item basé sur le type 'inc' ou 'exp':
        if(type === 'exp'){
          newItem = new Expense(ID, des, val);
        } else if (type === 'inc'){
          newItem = new Income(ID, des, val);
        }

        // Ajouter à la fin de notre data structure:
        data.allItems[type].push(newItem);
        // Retourner le nouvel élément:
        return newItem;
      },
      deleteItem: function(type, id){
        var ids, index;
        
        var ids = data.allItems[type].map(function(current){ // map() a accès au current element, current index et the entire array; la difference avec forEach, c'est que map() retourne un nouveau array
          return current.id; 
        // trouver l'index:
            // id = 6
            // ex : ids = [1 2 4 6 8]
        }); 
      index = ids.indexOf(id); // index : 3
      // delete this item from the array:
      if(index !== -1){
        data.allItems[type].splice(index, 1); // splice permet de retirer un element: prend en 1er argument le numero de la position où on veut commencer la suppression, puis le nombre d'élément qu'on veut supprimer
       // ex: ids = [1 2 4 6 8] ; index = 3 : à la position 3, ca va supprimer 1 donc içi, ca supprimé le 6
      }
      },
      calculateBudget: function(){
        // calculer les recettes (income) totaux et les dépenses (expenses) totales:
        calculateTotal('exp');
        calculateTotal('inc');
        // calculer le budget: income - expenses:
        data.budget = data.totals.inc - data.totals.exp;
        // calculer le pourcentage des recettes dépensé:
        if(data.totals.inc > 0){
          data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); // exemple: expense = 100  income= 200, spent : 50% = 100/200 = 0.5 * 100
        } else {
          data.percentage = -1;
        }                                                                   // Math.round() pour arrondir et ne garder que les entiers
      },

      calculatePercentages: function(){
          /* exemples :
           a = 20 
           b= 10
           c= 40 
          income = 100
          percentages ? a = 20/100 = 20%  b=10/100= 10%  c=40/100=40%
          */ 
         data.allItems.exp.forEach(function (cur){ // on a accès au current variable , c a d la variable en cours
            cur.calcPercentage(data.totals.inc); // pour chaque element courant, on applique la fonction calcPercentage = cela va calculer le pourcentage pour chaque dépense; on lui passe le total income
         });
      },

      getPercentages: function(){
        var allPerc = data.allItems.exp.map(function(cur){ // map RETOURNE quelquechose et le met dans une variable, alors que forEach non.
          return cur.getPercentage();
        });
        return allPerc;
      },

      getBudget: function(){
        return {
          budget: data.budget,
          totalInc: data.totals.inc,
          totalExp: data.totals.exp,
          percentage: data.percentage
        };
      },
      testing: function(){
        console.log(data);
      }
    }
 })();

// UI CONTROLLER:
var UIController = (function(){ 
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

   // Fonction pour formatter les nombres:
    var formatNumber = function(num, type){
    /* + ou - avant le nombre, 2 decimal points, une virgule séparant les 1000: ex: 2310.4567 ->  + 2,310.46
    2000 -> + 2,000.00
    */ 
   var numSplit, int, dec;
   num = Math.abs(num); // Math.abs ( abs = absolute) retire le signe du nombre
   num = num.toFixed(2); // permet d'avoir un nombre décimal de 2; c'est une méthode du number prototype
   numSplit = num.split('.');// on utilise le STRING '.' pour séparer le nombre en 2 PARTIES: la partie integer( ex. 2000) et la partie décimal ( ex. .46), d'où les 2 codes suivants
   int = numSplit[0]; // 1ère partie qui correspond à l'integer
   if(int.length > 3){ // si la longueur du nombre est sup à 3, alors c'est plus que 100 
     int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // ex.:  23510 : length is 5 ; on démarre à position 5 - 3 c a d position 2, qui est 5 , puis on lit 3 , ce qui donne 23,510
                            // input 2310, -> output 2,310
                            // substr() permet de ne prendre qu'une partie d'un string: içi, le 1er argument est l'index number où on veut commencer, et le 2è argument est combien de characteres on veut. ex: substr(0, 1) : 
                            // on démarre à la position zéro et on lit 1 élément.:  par ex. : 2310.4567 ->  cela va retourner 2;
                            // substr(1, 3) = on démarre à la position 1 et on lit 3 nombres
   }
   dec = numSplit[1]; // 2è partie qui correspond au décimal
   
   return (type === 'exp'? '-' : '+') + ' ' + int + '.' +  dec;
  };

  var nodeListForEach = function(list, callback){
    for(var i = 0; i < list.length; i++){
      callback(list[i], i); // le current, c'est la liste à la position i; l'index, c'est i
    }
  };

  return {
    getinput: function(){  
        return {
          type: document.querySelector(DOMstrings.inputType).value,
          description: document.querySelector(DOMstrings.inputDescription).value,
          value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // parseFloat convertit un string en nombre
        };
    },
    addListItem: function(obj, type){
      var html, newHtml, element;
      // Créer un string HTML avec un placeholder text:
      if(type === 'inc'){
        element = DOMstrings.incomeContainer;
          html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if(type === 'exp'){
          element = DOMstrings.expensesContainer;
          html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      // Remplacer le placeholder text par des données reçus de l'obj:
      newHtml = html.replace('%id%', obj.id); 
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      // Insérer le HTML dans le DOM:
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },
    // Supprimer un élément de l'UI:
    deleteListItem: function(selectorID){
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },
    
    clearFields: function(){
      var fields, fieldsArr ;
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array){
         current.value = "";
      });
      // Set focus on first element of array:
      fieldsArr[0].focus();
      
    },
    displayBudget: function(obj){
      var type;
      obj.budget > 0 ? type = 'inc' : type= 'exp';
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type ); // car le budget provient de obj
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
      
      if(obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function(percentages){ //prend en argument l 'array de pourcentage stocké dans notre app controller, qu'on appelle percentages
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
      
      nodeListForEach(fields, function(current, index){
        if(percentages[index] > 0){
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    // Fonction pour afficher le mois et l'année en cours:
    displayMonth: function(){
      var now, month, year;
      now = new Date(); // si on ne met rien en argument, ca retourne la date d'aujourd'ui;
                        // var christmas = new Date(2020, 11, 25); // le mois de décembre est 11 car c'est zéro- based;
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    // Fonction pour changer la couleur selon qu'on est en + ou - :
    changedType: function(){
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue
      );
      
      nodeListForEach(fields, function(cur){
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDOMstrings: function(){ 
        return DOMstrings; 
    }
  };
})();

// GLOBAL APP CONTROLLER:
var controller = (function(budgetCtrl, UICtrl){

  var setupEventListeners = function(){
    var DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event){
      if(event.keyCode === 13 || event.which === 13){ 
        ctrlAddItem();
      }
    });
    // Attacher un event sur l'élément parent du bouton supprimer :
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); // au click, on va appeler la fonction ctrlDeleteItem;

    // Mettre en place le change event:
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  var updateBudget = function(){
    // 5- Calculer le budget:
    budgetCtrl.calculateBudget();
    // 6- Retourner le budget:
    var budget = budgetCtrl.getBudget(); 
    
    // 7- Afficher le budget dans l'interface Utili. :
    UICtrl.displayBudget(budget); // on passe l'objet budget à la fonction
  };

  // Mettre à jour les pourcentages:
  var updatePercentages = function(){
    // 1. Calculer les pourcentages:
        budgetCtrl.calculatePercentages();
    // 2. Lire ces pourcentages à partir du budget controller:
        var percentages = budgetCtrl.getPercentages();
    // 3. Update le UI avec les nouveaus pourcentages:
       UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function(){
    var input, newItem;
    // 1- Récuperer les données écrite dans les inputs:
        input = UICtrl.getinput();
    // l'input description ne doit pas etre vide et le nombre doit etre un nombre et la valeur de l'input doit etre sup. à 0:
    if(input.description !== "" && !isNaN(input.value) && input.value > 0){
      // 2- Ajouter l'item au budget controller:
          newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3 - Ajouter l'item à l'interface utilisateur:
          UICtrl.addListItem(newItem, input.type);
      // 4- Clear the fields:
          UICtrl.clearFields();
      // 5- Calcul et mise à jour du budget:
         updateBudget();
      // 6- Calcul et mise à jour des pourcentages:
         updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event){ // on passe l'event à la fonction (l'objet event); la fonction callback de la method addEventListener a toujours accès à cet objet event
   var itemID, splitID, type, ID;

   itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
  
   if(itemID){
     // inc-1
    splitID = itemID.split('-'); // on utilise la methode split pour séparer le type de l'item (inc ou exp )et son ID, dans des variables
    type = splitID[0];
    ID = parseInt(splitID[1]); // parseInt convertit le string en integer( un nombre)
    // 1- supprimer l'item du data structure:
    budgetCtrl.deleteItem(type, ID);
    // 2- supprimer l'item de l'UI:
    UICtrl.deleteListItem(itemID);
    // 3- Update et montrer le new budget:
    updateBudget();
    // 4- Calcul et mise à jour des pourcentages:
    updatePercentages();
   }
  };

  return {
    init: function(){
      console.log('Application has started. ');
      UICtrl.displayMonth();
      UICtrl.displayBudget({  // on reset tout à zéro au rafraissement de la page
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1 
      }); 
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();


