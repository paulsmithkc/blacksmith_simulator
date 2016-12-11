
var g_game = null;

function newGame(div) {
    g_game = {
        currency: 100,
        inventory: {},
        recipeQueue: [],
        parties: [],
        div: div
    };
    
    $.each(g_items, function (name, e) {
        if (e.type == 'Resource') {
            addItemsToInventory(name, 10);
        }
    });
    
    refreshUI();
}

function refreshUI() {
    var div = g_game.div;
    div.find('.game-currency').html(displayCurrency());
    div.find('.game-inventory').html(displayInventory());
    div.find('.game-recipes').html(displayRecipeList());
    div.find('.game-recipe-queue').html(displayRecipeQueue());
}

function hasItemsInInventory(name, quantity) {
    var i = g_game.inventory[name];
    if (i == null) {
        return 0 >= quantity;
    } else {
        return i.quantity >= quantity;
    }
}

function addItemsToInventory(name, quantity) {
    var i = g_game.inventory[name];
    if (i == null) {
        g_game.inventory[name] = { quantity: quantity };
    } else {
        i.quantity += quantity;
    }
}

function queueRecipe(recipeListIndex) {
    var recipe = g_recipes[recipeListIndex];
    var haveComponents = true;
    
    $.each(recipe.components, function (componentIndex, component) {
        if (component.quantity > 0) {
            haveComponents &= hasItemsInInventory(component.name, component.quantity);
        }
    });
    
    if (!haveComponents) {
        //alert("Need more components");
        return;
    }
    
    $.each(recipe.components, function (componentIndex, component) {
        if (component.quantity > 0) {
            addItemsToInventory(component.name, -component.quantity);
        }
    });
    
    g_game.recipeQueue.push({
        recipeListIndex: recipeListIndex,
        name: recipe.resultName,
        quantity: recipe.resultQuantity,
        duration: recipe.duration
    });
    
    refreshUI();
}

function cancelRecipe(recipeQueueIndex) {
    var item = g_game.recipeQueue[recipeQueueIndex];
    var recipe = g_recipes[item.recipeListIndex];
    
    $.each(recipe.components, function (componentIndex, component) {
        if (component.quantity > 0) {
            addItemsToInventory(component.name, component.quantity);
        }
    });
    
    g_game.recipeQueue.splice(recipeQueueIndex, 1);
    
    refreshUI();
}

function displayCurrency() {
    return `${g_game.currency} gp`;
}

function displayInventory() {
    var html = '<div class="inventory">';
    
    $.each(g_game.inventory, function (name, e) {
        if (e.quantity != 0) {
            html += `<span class="inventory-item item">
                ${name} : ${e.quantity}
            </span>`;
        }
    });
    
    html += '</div>';
    return html;
}

function displayRecipeQueue() {
    var html = '<div class="recipe-queue">';
    
    $.each(g_game.recipeQueue, function (i, e) {
        html += `<div class="recipe-queue-item" onclick="cancelRecipe(${i});">
            <span class="item">${e.name} : ${e.quantity}</span> 
            <i class="fa fa-clock-o" aria-hidden="true"></i> 
            ${e.duration}
        </div>`;
    });
    
    html += '</div>';
    return html;
}

function displayRecipeList() {
    var enabledRecipes = '';
    var disabledRecipes = '';
    
    $.each(g_recipes, function (recipeListIndex, recipe) {
        var recipeComponentsHtml = '';
        var haveComponents = true;
        
        $.each(recipe.components, function (componentIndex, component) {
            if (component.quantity > 0) {
                recipeComponentsHtml += `<span class="recipe-component item">
                    ${component.name} : ${component.quantity}
                </span>`
                haveComponents &= hasItemsInInventory(component.name, component.quantity);
            }
        });
        
        var recipeResultHtml = `<span class="item">
            ${recipe.resultName} : ${recipe.resultQuantity}
        </span>`;
        
        var recipeHtml = 
        `<div class="recipe ${haveComponents ? 'recipe-enabled' : 'recipe-disabled'}" 
              onclick="queueRecipe(${recipeListIndex});">
            <span class="recipe-components">${recipeComponentsHtml}</span>
            <i class="fa fa-chevron-circle-right" aria-hidden="true"></i>
            <span class="recipe-result">${recipeResultHtml}</span>
            <i class="fa fa-clock-o" aria-hidden="true"></i>
            ${recipe.duration}
        </div>`;
        if (haveComponents) {
            enabledRecipes += recipeHtml;
        } else {
           disabledRecipes += recipeHtml; 
        }
    });
    
    var html = `<div class="recipe-list">${enabledRecipes}${disabledRecipes}</div>`;
    return html;
}


function displayItemList() {
    var html = '<div class="item-list">';
    
    $.each(g_items, function (name, e) {
        html += `<div class="item-list-item item">
            name: ${name}
            <br/>type: ${e.type}
            <br/>material: ${e.material}
        </div>`;
    });
    
    html += '</div>';
    return html;
}
