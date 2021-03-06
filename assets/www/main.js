var cart = new Cart();

/*
 * Used with jquery $.data() when attaching shopping cart data to arbitrary DOM
 * items.
 */
var itemDataKey = "product-data";

/*
 * Transitioning to the condiments page is a result of some being clicked. We
 * need to track which sub that was.
 */
var subItemClicked = -1;

function onLoad() {
	document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {

}

function extractArray(hashish, key) {
	var list = [];
	$.each(hashish, function(i, item) {
		list.push(item[key]);
	});
	return list;
}

/*******************************************************************************
 * Menu list inflator
 ******************************************************************************/
function menuInflateCategory(listName, header, items) {
	var list = $('#' + listName);
	var categoryCount = list.attr('categoryCount');
	var appendStr = "";
	if (typeof categoryCount == 'undefined') {
		categoryCount = 0;
	}
	if (header) {
		appendStr += '<li name="' + listName + '-divider-' + categoryCount
				+ '" data-role="list-divider">' + header + '</li>';
	}
	appendStr += '<ol>';
	list.append(appendStr);
	$.each(items, function(i, item) {
		var itemId = listName + '-item-' + categoryCount + '-' + i;
		var itemHandle;
		list.append('<li name="item_name" id="' + itemId + '">'
				+ item['item_name'] + '<p name="item_desc">'
				+ item['item_desc'] + '</p>'
				+ '<p class=ui-li-aside name="item_price">$'
				+ item['item_price'] + '</p>' + '</li>');
		itemHandle = $('#' + itemId);
		itemHandle.bind('click', {
			element : itemHandle
		}, selectSub);
		itemHandle.jqmData(itemDataKey, item);
	});
	list.append('</ol>');
	categoryCount++;
	list.attr('categoryCount', categoryCount);
}

function menuInflateList(listName, all) {
	var list = $('#' + listName);
	list.html('');
	list.listview("destroy").listview();

	var sorted = sortObj(all);
	$.each(sorted, function(key, value) {
		menuInflateCategory(listName, key, value);
	});
	list.listview('refresh');
}
/** *********************************************** */

/*******************************************************************************
 * Shopping cart list inflator
 ******************************************************************************/
function cartInflateSub(listName, items) {
	var list = $('#' + listName);
	var count = 0;
	var appendStr = "";
	var sandIndex = -1;
	var sandItem;
	/***************************************************************************
	 * There should be one sandwich in the set of items passed in, find it
	 **************************************************************************/
	for ( var i = 0; i < items.length; ++i) {
		var item = items[i];
		if (item['sandwich'] == true) {
			sandIndex = i;
			sandItem = item;
			break;
		}
	}
	if (sandIndex == -1) {
		alert("Error: no sandwich found when inflating subs");
		return;
	}

	/***************************************************************************
	 * We now have the sub, add it
	 **************************************************************************/
	var categoryCount = list.attr('subCount');
	if (typeof subCount == 'undefined') {
		subCount = 0;
	}
	var itemId = listName + '-item-' + subCount;
	var itemPriceId = listName + '-item_price-' + subCount;
	var priceTotal = sandItem['item_price'];
	list.append('<li name="item_name" id="' + itemId + '">'
			+ sandItem['item_name'] +
			// '<p name="item_desc">' + item['item_desc'] + '</p>' +
			'<p class=ui-li-aside name="item_price" id="' + itemPriceId + '">'
			+ sandItem['item_price'] + '</p>' + '</li>');
	var priceHandle = $('#' + itemPriceId);
	priceHandle.html('');

	/***************************************************************************
	 * Add the condiment items
	 **************************************************************************/
	$.each(items, function(i, item) {
		if (i == sandIndex) // skip sandwich
			return;

		var itemId = listName + '-item-' + subCount + '-' + i;
		var itemHandle;
		list.append('<li name="item_name" id="' + itemId + '">'
				+ '<p name="item_desc">' + item['item_desc'] + '</p>'
				+ '</a></li>');
		itemHandle = $('#' + itemId);
		itemHandle.jqmData(itemDataKey, item);
		priceTotal += item['item_price'];
	});
	priceHandle.html('$' + priceTotal);
	subCount++;
	list.attr('subCount', subCount);
}
/** *********************************************** */

/*******************************************************************************
 * Vegetable and Condiments list inflator
 ******************************************************************************/
function additivesInflate(listName, headerStr, items) {
	var list = $('#' + listName);
	var headerCount = list.attr('headerCount');
	if (typeof (headerCount) == 'undefined') {
		headerCount = 0;
	}
	var headerId = listName + '-divider-' + headerCount;
	list.append('<li data-role="list-divider" id="' + headerId + '">'
			+ headerStr + '</li>');

	var headerHandle = $('#' + headerId);
	/* get the last category # */

	list.append('<ol>');
	$.each(items, function(i, item) {
		var itemId = listName + '-item-' + headerCount + '-' + i;
		var itemHandle;
		list.append('<img id="' + itemId + '" class="' + headerStr + '" src="'
				+ item['item_desc'] + '"></img>');
		itemHandle = $('#' + itemId);
		itemHandle.bind('click', {
			element : itemHandle
		}, imageToggleFade);
		itemHandle.jqmData('state', false);
		itemHandle.jqmData(itemDataKey, item);
	});
	list.append('</ol>');
	headerCount++;
	list.attr('headerCount', headerCount);
}

function additivesInflateCheese(listName, headerStr, items) {
	var list = $('#' + listName);
	var headerCount = list.attr('headerCount');
	if (typeof (headerCount) == 'undefined') {
		headerCount = 0;
	}
	var headerId = listName + '-divider-' + headerCount;
	list.append('<li data-role="list-divider" id="' + headerId + '">'
			+ headerStr + '</li>');

	var headerHandle = $('#' + headerId);
	/* get the last category # */

	headerHandle.after('<ol>');
	$
			.each(
					items,
					function(i, item) {
						var itemId = listName + '-item-' + headerCount + '-'
								+ i;
						var itemHandle;

						headerHandle
								.after('<p> <h3><label for="slider">'
										+ item["item_name"]
										+ '</label> \
					<select name="slider" data-role="slider"> \
						<option value="off">Off</option> \
						<option value="on">On</option> \
					</select> \
					</h3></p>');
						itemHandle = $('#' + itemId);
						itemHandle.jqmData(itemDataKey, item);
					});
	headerHandle.append('</ol>');
	headerCount++;
	list.attr('headerCount', headerCount);
}

function additivesInflateList(listName, results) {
	var list = $('#' + listName);
	list.html('');
	list.listview("destroy").listview();

	additivesInflate(listName, "Vegetable", results['vegetable']);
	additivesInflate(listName, "Condiment", results['condiment']);
	additivesInflateCheese(listName, "Cheese", results['cheese']);

	$('#additives-add').bind('click', {
		element : $('#additives-add')
	}, onClickAddItem);

	list.listview('refresh');
}
/** *********************************************** */

/**
 * Selected a sub sandwich.
 * Generate and display the ingredients list.
 */
function selectSub(event) {
	// alert("Sub selected");
	subItemClicked = event.data.element.jqmData(itemDataKey);
	console.log("Sub clicked on " + JSON.stringify(subItemClicked));
	$.mobile.changePage("#additives", { transition: "pop" });
	
	var listName = 'listAdditives';
	var list = $('#' + listName);
	var results = {};
	var count = 3;
	getRequest('cat', 'condiment', function(reqKey, reqValue, items) {
		results[reqValue] = items;
		count--;
		if (count == 0) {
			additivesInflateList(listName, results);
		}
	}); // getRequest()

	getRequest('cat', 'vegetable', function(reqKey, reqValue, items) {
		results[reqValue] = items;
		count--;
		if (count == 0) {
			additivesInflateList(listName, results);
		}
	}); // getRequest()

	getRequest('cat', 'cheese', function(reqKey, reqValue, items) {
		results[reqValue] = items;
		count--;
		if (count == 0) {
			additivesInflateList(listName, results);
		}
	}); // getRequest()

}

function onClickAddItem(event) {
	var listName = 'listAdditives';
	var itemsSelected = [];
	var itemsSelectedStr = [];

	/* Add sub to cart */
	var groupId = cart.getGroupCount();
	cart.addItem(groupId, subItemClicked);

	for ( var i = 0; i < 2; ++i) {
		var countId = 0;
		itemsSelected[i] = [];
		itemsSelectedStr[i] = "";
		while (1) {
			var itemName = listName + '-item-' + i + '-' + countId;
			var itemHandle = $('#' + itemName);
			var item = itemHandle.jqmData(itemDataKey);

			if (itemHandle.length == 0) {
				break;
			}
			var state = itemHandle.jqmData('state');
			// alert("State for " + itemName + " is " + state);
			if (state == true) {
				cart.addItem(groupId, item); // add additive to same group as
												// the sub in cart
				itemsSelected[i].push(itemHandle);
				itemsSelectedStr[i] += item['item_name'] + ",";
			}
			++countId;
		}
	}

	alert("Successfully added:\n" + "Sub: " + subItemClicked['item_name']
			+ "\nVegetables: " + itemsSelectedStr[0] + "\nCondiments: "
			+ itemsSelectedStr[1] + "\nCheese2: ");

	cart.calcGroupPrice(groupId);
	// var str = cart.debugCart2String();
	// alert("Items in cart\n" + str);

}

$(document).ready(function() {
//	var menuLink = $('#menuLink');
//	
//	$(menuLink).on("pagebeforeshow", function(event) {
//		
//	});

	$('#menuLink').click(function() {
		$.mobile.changePage("#menu", { transition: "pop" });

		var listName = 'list';
		var list = $('#' + listName);
		var results = {};
		var count = 0;
		getRequest('type', 'sandwich_types', function(reqKey1, reqValue1, cat) {
			var headers = extractArray(cat, 'cat_name');
			count = headers.length;
			$.each(headers, function(i, header) {
				getRequest('cat', header, function(reqKey, reqValue, items) {
					// inflateCategory(list, reqValue, items);
					$.each(items, function(j, item) {
						item['sandwich'] = true;
					});
					results[reqValue] = items;
					count--;
					if (count == 0) {
						menuInflateList(listName, results);
					}
				}); // getRequest()
			}); // each()
		}); // getRequest()
	}); // #menuLink click

	$('#cartLink').click(function() {
		$.mobile.changePage("#cart", { transition: "pop" });

		var listName = 'cartList';
		var list = $('#' + listName);
		list.html('');
		list.listview("destroy").listview();

		list.append('<ol>');

		$.each(cart.getGroups(), function(i, group) {
			cartInflateSub(listName, cart.getItems(group));
		});
		list.append('</ol>');
		list.listview('refresh');
	});
}); // function()
