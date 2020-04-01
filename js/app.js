/** Storage Controller  */
const StorageCtrl = (function(){
    /** Private Var and Func */

    /** Public Var and Func */
    return {
        storeItemLocalStorage: function(item){
            let items ;
            /** Check if any item in LS */
            if(localStorage.getItem('items') === null){
                items =[];
                items.push(item);
                localStorage.setItem("items", JSON.stringify(items));
            } else {
                items = JSON.parse(localStorage.getItem('items'));
                items.push(item);
                localStorage.setItem("items", JSON.stringify(items));
            }
        },
        getItemLocalStorage: function(){
            let items ;
            if(localStorage.getItem('items') === null){
                items = []; 
            } else {
                items = JSON.parse(localStorage.getItem("items"));
            }
            return items ; 
        },
        updateLocalStorage: function(itemsList){
            /** Remove All LS */
            localStorage.removeItem("items");
            localStorage.setItem("items", JSON.stringify(itemsList));
        },
        clearLocalStorage: function(){
            localStorage.removeItem("items");
        }
    }
})();

/** 
 * 
 * Item Controller  
 * 
 * */
const ItemCtrl = (function(){
    /** Item constructor */
    const Item = function(id, name, calories){
        return {
            id: id,
            name: name, 
            calories: parseInt(calories)
        }
    } 

    /**Private var and func */
    const data = {
        item: StorageCtrl.getItemLocalStorage(),
        currentItem : null,
        totalCalories : 0
    } 


    /**Global var and func */
    return {
        setCurrentItem: function(item){
            data.currentItem = item;
        },
        setItemNull : function(){
            data.item = [];
        },
        setItemByID :function(ID, name, calories){
            console.log(name);
            console.log(calories);
            data.item.forEach(eachItem => {
                if (eachItem.id === ID){
                    eachItem.name = name;
                    eachItem.calories = calories;
                    console.log("Item Updated !");
                }
            })
        },
        getCurrentItem(){
            return data.currentItem;
        },
        getItemByID :function(ID){
            let output ;
            data.item.forEach( eachItem =>{
                if (eachItem.id === parseInt(ID)){
                    output = eachItem;
                }
            } );
            return output;
        },
        logData : function() { 
            return data;
        },
        getItem : function() { 
            return data.item;
        },
        createItem : function(id, name, calories){
            const item = new Item(id, name, calories);
            data.item.push(item);
            return item;
        },
        calculateTotalCalories(){
            let total = 0;
            for(let i = 0; i < data.item.length ; i++){
                total += data.item[i].calories;
            }
            return total;
        },
        removeItemByID(id){
            // Get ids
            const ids = data.item.map(function(item){
                return item.id;
            });

            // Get index
            const index = ids.indexOf(id);

            // Remove item
            data.item.splice(index, 1);
        }
    }
})();

/** 
 * 
 * UI Controller 
 * 
 * */
const UICtrl = (function(){
    /**Private var and func */
    const UISelector = {
        itemList: "#item-list",
        eachItem: ".list-group-item",
        clearAll: "#clear-all",
        addItem: "#add-item",
        editItem: "#edit-item",
        delItem: "#del-item",
        back: "#back"
    }

    /**Global var and func */
    return {

        showEditState :function(){
            document.querySelector(UISelector.addItem).style.display = 'none' ;
            document.querySelector(UISelector.editItem).style.display = 'inline' ;
            document.querySelector(UISelector.delItem).style.display = 'inline' ;
            document.querySelector(UISelector.back).style.display = 'inline' ;  
        },

        clearEditState :function(){
            document.querySelector(UISelector.addItem).style.display = 'inline' ;
            document.querySelector(UISelector.editItem).style.display = 'none' ;
            document.querySelector(UISelector.delItem).style.display = 'none' ;
            document.querySelector(UISelector.back).style.display = 'none' ;
        },

        addNewItem: function(item){
            const itemList = document.querySelector(UISelector.itemList);
            let output = '';
            output = `
            <li class="list-group-item text-dark" id="item-${item.id}">
                <strong>${item.name}</strong> : ${item.calories} calories
                <a href="#" class="bg-light float-right ">
                    <i class="edit-item fas fa-pencil-alt"></i>
                </a>
            </li>`;
            itemList.innerHTML += output;
        },

        getSelector: function(){
            return UISelector;
        },

        populateItems : function(items){
            const itemList = document.querySelector(UISelector.itemList);
            let output = '';
            items.forEach(element => {
                output += `
                <li class="list-group-item text-dark" id="item-${element.id}">
                    <strong>${element.name}</strong> : ${element.calories} calories
                    <a href="#" class="bg-light float-right ">
                        <i class="edit-item fas fa-pencil-alt"></i>
                    </a>
                </li>`
            });
            itemList.innerHTML = output;
        },

        clearInput : function(){
            const meal_input = document.getElementById('meal');
            const calories_input = document.getElementById('calories');
            meal_input.value = '';
            calories_input.value = '';
        },

        addItemToEdit : function(item){
            const meal_input = document.getElementById('meal');
            const calories_input = document.getElementById('calories');
            meal_input.value = item.name;
            calories_input.value = item.calories;
        },

        updateTotalCalories : function(newCalories){
            document.getElementById("total").innerHTML = `Total Calories : ${newCalories}`;
        }
    } 
})();

/** 
 * 
 * APP Controler 
 * 
 * */
const AppCtrl = (function(ItemCtrl, UICtrl, StorageCtrl){
    /**Private var and func */
    const loadEventListner = function(){
        const UISelector = UICtrl.getSelector();

        /** Add item event */
        document.querySelector(UISelector.addItem)
        .addEventListener("click",itemAddSubmit);

        document.querySelector(UISelector.itemList)
        .addEventListener("click",enableEditItem);

        document.querySelector(UISelector.back)
        .addEventListener("click",backToAddItem);

        document.querySelector(UISelector.editItem)
        .addEventListener("click",editItem);

        document.querySelector(UISelector.delItem)
        .addEventListener("click", delItem);

        document.querySelector(UISelector.clearAll)
        .addEventListener("click", clearAllItem);
    

        /**
         * Disable key "ENTER"
         */

        document.addEventListener("keypress", function(event){
            if(event.keyCode === 13){
                event.preventDefault();
                return false;
            }
        })

    }

    /***
     * ADD MEAL BUTTON 
     */
    const itemAddSubmit = function(event){
        /** Grab necessray HTML element */
        const meal_input = document.getElementById('meal');
        const calories_input = document.getElementById('calories');
        const currentItemList = ItemCtrl.getItem();

        if ( (meal_input.value !== '') && (calories_input.value !== '')){
            /** Meal and calories input is valid notify user */
            meal_input.classList.add('is-valid');
            calories_input.classList.add('is-valid');
            
            /** Proceed to add item to item list */
            const newItem = new ItemCtrl.createItem(currentItemList.length+1, meal_input.value, calories_input.value) ;
            UICtrl.addNewItem(newItem);
            UICtrl.updateTotalCalories(ItemCtrl.calculateTotalCalories());
            setTimeout(() => {

                meal_input.classList.remove('is-valid');
                calories_input.classList.remove('is-valid');

                /** Local Storage Save */
                StorageCtrl.storeItemLocalStorage(newItem);
                UICtrl.clearInput();
            }, 2000);
        } else {
            meal_input.classList.add('is-invalid');
            calories_input.classList.add('is-invalid');
            setTimeout(() => {

                meal_input.classList.remove('is-invalid');
                calories_input.classList.remove('is-invalid');

                UICtrl.clearInput();
            }, 2000);
        }
        event.preventDefault();
    }

    /***
     * BACK BUTTON 
     */
    const backToAddItem = function(event){
        UICtrl.clearEditState();
        event.preventDefault();
    }

    /**
     * ENABLE EDIT BUTTON or the PENCIL BUTTON
     */
    const enableEditItem = function(event){
        if (event.target.classList.contains("edit-item")) 
        {
            UICtrl.showEditState();
            const li = event.target.parentNode.parentNode;
            const item_ID = li.id.split("-")[1];
            ItemCtrl.setCurrentItem(ItemCtrl.getItemByID(item_ID));
            UICtrl.addItemToEdit(ItemCtrl.getCurrentItem());
        };
        event.preventDefault();
    } 

    /**
     * EDIT MEAL BUTTON
     */
    const editItem = function(event){
        const meal_input = document.getElementById('meal');
        const calories_input = document.getElementById('calories');
        const currentID = parseInt(ItemCtrl.getCurrentItem().id);
        ItemCtrl.setItemByID(currentID, meal_input.value, parseInt(calories_input.value));
        UICtrl.populateItems(ItemCtrl.getItem());
        UICtrl.updateTotalCalories(ItemCtrl.calculateTotalCalories());
        
        meal_input.classList.add('is-valid');
        calories_input.classList.add('is-valid');

        setTimeout(() => {

            meal_input.classList.remove('is-valid');
            calories_input.classList.remove('is-valid');
            /** Update LS */
            StorageCtrl.updateLocalStorage(ItemCtrl.getItem());
            UICtrl.clearInput();
        }, 2000);
        /** Update LS */
        StorageCtrl.updateLocalStorage(ItemCtrl.getItem());
        event.preventDefault();
    }
    
    /**
     * DELETE BUTTON
     */
    const delItem = function(event){
        /** Clear Input */
        UICtrl.clearInput();
        /** Clear Element */    
        ItemCtrl.removeItemByID(ItemCtrl.getCurrentItem().id);
        console.log(ItemCtrl.getCurrentItem())
        /** Current item is Null */
        ItemCtrl.setCurrentItem(null);
        /** Display */
        UICtrl.populateItems(ItemCtrl.getItem());
        /** Update Calories */
        UICtrl.updateTotalCalories(ItemCtrl.calculateTotalCalories());
        /** Update LS */
        StorageCtrl.updateLocalStorage(ItemCtrl.getItem());
        event.preventDefault();
    }
    
    /**
     * CLEAR ALL ITEM
     */
    const clearAllItem = function(event){
        /** Clear Input */
        UICtrl.clearInput();
        /** DS is empty */
        ItemCtrl.setItemNull();
        /** Current item is Null */
        ItemCtrl.setCurrentItem(null);
        /** Display */
        UICtrl.populateItems(ItemCtrl.getItem());
        /** Update Calories */
        UICtrl.updateTotalCalories(ItemCtrl.calculateTotalCalories());
        /** Update LS */
        StorageCtrl.clearLocalStorage();
        event.preventDefault();
    }
    
    /**Global var and func */
    return {
        init: function(){
            console.log("Init App...");
            const items = ItemCtrl.getItem();
            UICtrl.populateItems(items);
            UICtrl.updateTotalCalories(ItemCtrl.calculateTotalCalories());
            UICtrl.clearEditState();
            loadEventListner();
        }
    }
})(ItemCtrl, UICtrl, StorageCtrl);

AppCtrl.init();