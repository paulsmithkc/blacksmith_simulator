
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
    
    div.find('.game-inventory').html(displayInventory());
    div.find('.game-recipes').html(displayRecipeList());
    div.find('.game-recipe-queue').html(displayRecipeQueue());
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
    
    if (recipe.component1Quantity > 0) {
        addItemsToInventory(recipe.component1Name, -recipe.component1Quantity);
    }
    if (recipe.component2Quantity > 0) {
        addItemsToInventory(recipe.component2Name, -recipe.component2Quantity);
    }
    if (recipe.component3Quantity > 0) {
        addItemsToInventory(recipe.component3Name, -recipe.component3Quantity);
    }
    
    g_game.recipeQueue.push({
        recipeListIndex: recipeListIndex,
        name: recipe.resultName,
        quantity: recipe.resultQuantity,
        duration: recipe.duration
    });
    
    g_game.div.find('.game-inventory').html(displayInventory());
    g_game.div.find('.game-recipe-queue').html(displayRecipeQueue());
}

function cancelRecipe(recipeQueueIndex) {
    var item = g_game.recipeQueue[recipeQueueIndex];
    var recipe = g_recipes[item.recipeListIndex];
    
    if (recipe.component1Quantity > 0) {
        addItemsToInventory(recipe.component1Name, recipe.component1Quantity);
    }
    if (recipe.component2Quantity > 0) {
        addItemsToInventory(recipe.component2Name, recipe.component2Quantity);
    }
    if (recipe.component3Quantity > 0) {
        addItemsToInventory(recipe.component3Name, recipe.component3Quantity);
    }
    
    g_game.recipeQueue.splice(recipeQueueIndex, 1);
    
    g_game.div.find('.game-inventory').html(displayInventory());
    g_game.div.find('.game-recipe-queue').html(displayRecipeQueue());
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
    var html = '<div class="recipe-list">';
    
    $.each(g_recipes, function (i, recipe) {
        var recipeComponentsHtml = '';
        if (recipe.component1Quantity > 0) {
            recipeComponentsHtml += `<span class="recipe-component item">
                ${recipe.component1Name} : ${recipe.component1Quantity}
            </span>`;
        }
        if (recipe.component2Quantity > 0) {
            recipeComponentsHtml += `<span class="recipe-component item">
                ${recipe.component2Name} : ${recipe.component2Quantity}
            </span>`;
        }
        if (recipe.component3Quantity > 0) {
            recipeComponentsHtml += `<span class="recipe-component item">
                ${recipe.component3Name} : ${recipe.component3Quantity}
            </span>`;
        }
        
        var recipeResultHtml = `<span class="item">
            ${recipe.resultName} : ${recipe.resultQuantity}
        </span>`;
        
        html += `<div class="recipe" onclick="queueRecipe(${i});">
            <span class="recipe-components">${recipeComponentsHtml}</span>
            <i class="fa fa-chevron-circle-right" aria-hidden="true"></i>
            <span class="recipe-result">${recipeResultHtml}</span>
            <i class="fa fa-clock-o" aria-hidden="true"></i>${recipe.duration}
        </div>`;
    });
    
    html += '</div>';
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
