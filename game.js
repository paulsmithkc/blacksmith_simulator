
var g_game = null;

function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min));
}

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
            addItemsToInventory(name, 20);
        }
    });
    
    var availableNames = g_adventurer_names.slice();
    for (var i = 0; i < 3; ++i) {
        var party = {
            adventurers: [],
            loot: {}
        };
        var party_classes = [
            { name: 'Fighter', weapon: 'Iron Sword' }, 
            { name: 'Rouge', weapon: 'Iron Sword' }, 
            { name: 'Ranger', weapon: 'Bow' }, 
            { name: 'Wizard', weapon: 'Staff' }, 
        ];
        for (var j = 0; j < party_classes.length; ++j) {
            var nameIndex = randomInt(0, availableNames.length);
            var nameObj = availableNames[nameIndex];
            availableNames.splice(nameIndex, 1);
            
            party.adventurers.push({
                name: nameObj.name,
                icon: nameObj.icon,
                cls: party_classes[j].name,
                level: 1,
                dead: false,
                health: 10,
                helmet: null,
                breastplate: null,
                clothing: null,
                weapon: party_classes[j].weapon,
                potions: {
                    'Health Potion': 1
                },
                arrows: party_classes[j].name == 'Ranger' ? 10 : 0
                
            });
        }
        g_game.parties.push(party);
    }
    
    sleep();
    //refreshUI();
}

function refreshUI() {
    var div = g_game.div;
    div.find('.game-currency').html(displayCurrency());
    div.find('.game-inventory').html(displayInventory());
    div.find('.game-recipes').html(displayRecipeList());
    div.find('.game-recipe-queue').html(displayRecipeQueue());
    div.find('.game-parties').html(displayParties());
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

function addItemsToPartyLoot(party, name, quantity) {
    var i = party.loot[name];
    if (i == null) {
        party.loot[name] = { quantity: quantity };
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

function sleep() {
    
    // Work on recipes in queue
    var hoursRemaining = 8;
    while (g_game.recipeQueue.length > 0 && hoursRemaining > 0) {
        var item = g_game.recipeQueue[0];
        if (item.duration > hoursRemaining) {
            item.duration -= hoursRemaining;
            hoursRemaining = 0;
        } else {
            hoursRemaining -= item.duration;
            item.duration = 0;
            
            addItemsToInventory(item.name, item.quantity);
            g_game.recipeQueue.splice(0, 1);
        }
    }
    
    // Send parties out adventuring
    $.each(g_game.parties, function (partyIndex, party) {
        $.each(g_items, function (name, e) {
            if (e.type == 'Resource') {
                addItemsToPartyLoot(party, name, randomInt(0, 6));
            }
        });
    });
    
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
        html += `<div class="recipe-queue-item" onclick="cancelRecipe(${i});" tabindex="0">
            <span class="item">${e.name} : ${e.quantity}</span> 
            <i class="fa fa-clock-o" aria-hidden="true"></i> 
            ${e.duration} hrs
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
                recipeComponentsHtml += 
                `<span class="recipe-component item">
                    ${component.name} : ${component.quantity}
                </span>`
                haveComponents &= hasItemsInInventory(component.name, component.quantity);
            }
        });
        
        var recipeResultHtml = 
        `<span class="item">
            ${recipe.resultName} : ${recipe.resultQuantity}
        </span>`;
        
        var recipeHtml = 
        `<div class="recipe ${haveComponents ? 'recipe-enabled' : 'recipe-disabled'}" 
              onclick="queueRecipe(${recipeListIndex});" tabindex="0">
            <span class="recipe-components">${recipeComponentsHtml}</span>
            <i class="fa fa-chevron-circle-right" aria-hidden="true"></i>
            <span class="recipe-result">${recipeResultHtml}</span>
            <i class="fa fa-clock-o" aria-hidden="true"></i>
            ${recipe.duration} hrs
        </div>`;
        if (haveComponents) {
            enabledRecipes += recipeHtml;
        } else {
           disabledRecipes += recipeHtml; 
        }
    });
    
    var html = `${enabledRecipes}${disabledRecipes}`;
    return html;
}

function displayParties() {
    var html = '';
    
    $.each(g_game.parties, function (partyIndex, party) {
        html += '<div class="party">';
        html += '<div class="party-members">';
        $.each(party.adventurers, function (memberIndex, a) {
            html += '<span class="party-member adventurer">';
            html += `${a.name} the ${a.cls}`;
            if (a.weapon != null) {
                html += `<br/><span class="weapon item">${a.weapon}</span>`;
            }
            if (a.helmet != null) {
                html += `<br/><span class="helmet item">${a.helmet}</span>`;
            }
            if (a.breastplate != null) {
                html += `<br/><span class="breastplate item">${a.breastplate}</span>`;
            }
            if (a.clothing != null) {
                html += `<br/><span class="clothing item">${a.clothing}</span>`;
            }
            $.each(a.potions, function (potionName, potionQuantity)  {
                html += `<br/><span class="potion item">${potionName} : ${potionQuantity}</span>`;
            });
            if (a.arrows != 0) {
                html += `<br/><span class="arrow item">Arrow : ${a.arrows}</span>`;
            }
            html += '</span>';
        });
        html += '</div><div class="party-loot">';
        $.each(party.loot, function (itemName, item) {
            if (item.quantity != 0) {
                html += 
                `<span class="party-loot-item item">
                    ${itemName} : ${item.quantity}
                </span>`;
            }
        });
        html += '</div></div>';
    });
    
    return html;
}

function displayItemList() {
    var html = '<div class="item-list">';
    
    $.each(g_items, function (name, e) {
        html += 
        `<div class="item-list-item item">
            name: ${name}
            <br/>type: ${e.type}
            <br/>material: ${e.material}
        </div>`;
    });
    
    html += '</div>';
    return html;
}
