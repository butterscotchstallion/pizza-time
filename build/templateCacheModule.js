angular.module("templateCacheModule", []).run(["$templateCache", function($templateCache) {$templateCache.put("./public/build/order-form/order-form.html","<h3>Order Form <small><em>Minimum order: {{settings.minimumOrderAmount | currency}}</em></small></h3>\n<hr>\n\n<form action=\"#\" id=\"order-form\">\n	<div class=\"row\">\n		<div class=\"col-md-6\">\n			<tabset>\n		  		<tab heading=\"Service Method\">\n		  			<div class=\"row\">\n						<div class=\"col-md-12\" \n							 ng-include=\"\'components/order-form/partials/_service-methods.html\'\"></div>\n					</div>\n		  		</tab>\n\n			    <tab heading=\"Pie\">\n			   		<div class=\"row\">\n						<div class=\"col-md-12\" ng-include=\"\'components/order-form/partials/_pies.html\'\"></div>\n					</div>\n				</tab>\n\n			   	<tab heading=\"Toppings\">\n			   		<div class=\"row\">\n						<div class=\"col-md-12\" ng-include=\"\'components/order-form/partials/_toppings.html\'\"></div>\n					</div>\n			   	</tab>\n\n			   	<tab heading=\"Side items\">\n			   		<div class=\"row\">\n						<div class=\"col-md-12\" ng-include=\"\'components/order-form/partials/_sides.html\'\"></div>\n					</div>\n			   	</tab>\n\n			   	<tab heading=\"Coupons\">\n			   		<div class=\"row\">\n						<div class=\"col-md-12\" ng-include=\"\'components/order-form/partials/_coupons.html\'\"></div>\n					</div>\n			   	</tab>\n			</tabset>\n		</div>\n\n		<div class=\"col-md-4\">\n			<div class=\"row\">\n				<div class=\"col-md-12\" ng-include=\"\'components/order-form/partials/_order-summary.html\'\"></div>\n			</div>\n		</div>\n	</div>\n</form>");
$templateCache.put("./public/build/order-form/partials/_coupons.html","<h4>Coupons <small>Coupons can only be applied to a valid order.</small></h4>\n\n<div ng-controller=\"CouponController\">\n	<div class=\"row\">\n		<div class=\"col-md-6\">\n			<div class=\"form-group has-feedback\" \n				 ng-class=\"{\'has-error\': invalidCoupon, \'has-success\': coupon.length > 0 && !invalidCoupon && isValidOrder}\">\n				<label class=\"block\">Code</label>\n\n				<input type=\"text\"\n					   name=\"coupon-code\"\n					   maxlength=\"{{settings.maxCouponCodeLength}}\"\n					   ng-model=\"coupon\"\n					   ng-change=\"invalidCoupon = false\"\n					   ng-disabled=\"coupons.length === 0\"\n					   class=\"form-control\">\n\n				<span class=\"glyphicon glyphicon-ok form-control-feedback\" \n					  ng-show=\"coupon.length > 0 && !invalidCoupon && isValidOrder\"\n					  aria-hidden=\"true\"></span>\n\n				<span class=\"glyphicon glyphicon-remove form-control-feedback\"\n					  aria-hidden=\"true\"\n					  ng-show=\"invalidCoupon\"></span>\n\n				<p ng-show=\"invalidCoupon\" class=\"coupon-wrapper\">\n					<strong class=\"error\">Oops, we couldn\'t apply that coupon to your order.</strong>\n				</p>\n			</div>\n		</div>\n	</div>\n\n	<div class=\"row\">\n		<div class=\"col-md-3\">\n			<div class=\"form-group\">\n				<button type=\"button\"\n						ng-click=\"addCoupon()\"\n						ng-disabled=\"!orderIsValid\"\n						class=\"btn btn-success\"><span class=\"glyphicon glyphicon-scissors\"></span> Apply Coupon</button>\n			</div>\n		</div>\n	</div>\n</div>\n");
$templateCache.put("./public/build/order-form/partials/_order-summary.html","<h4>Your Order</h4>\n\n<div class=\"row\">\n	<div class=\"col-md-12\">\n		<p ng-show=\"order.items.length === 0\"><em>Nothing yet!</em></p>\n\n		<table ng-show=\"order.items.length > 0\" \n			   class=\"order-items table table-condensed table-hover\">\n			<thead>\n				<tr>\n					<th>Item</th>\n					<th>Quantity</th>\n					<th>Price</th>\n					<th></th>\n				</tr>\n			</thead>\n			<tbody>\n				<tr ng-repeat=\"item in order.items | orderBy: [\'type\',\'subType\']\" \n					class=\"repeated-item\"\n					ng-class=\"{\'success\': item.type === \'coupon\', \'warning\': item.type === \'serviceMethod\'}\">\n					<td class=\"order-line-item\" title=\"{{item.name}}\">\n						<span ng-show=\"!item.isMeat && item.type === \'topping\'\" \n							  class=\"glyphicon glyphicon-tree-deciduous\"></span>\n						<span ng-show=\"item.isMeat && item.type === \'topping\'\" \n							  class=\"glyphicon glyphicon-piggy-bank\"></span>\n						<span ng-show=\"item.type === \'pie\'\" \n							  class=\"glyphicon glyphicon-dashboard\"></span>\n						<span ng-show=\"item.type === \'sideItem\'\" \n							  class=\"glyphicon glyphicon-scale\"></span>\n						<span ng-show=\"item.type === \'coupon\'\" \n							  class=\"glyphicon glyphicon-gift\"></span>\n						<span ng-show=\"item.type === \'serviceMethod\'\" \n							  class=\"glyphicon glyphicon-usd\"></span>\n						{{item.name}}\n					</td>\n\n					<td class=\"order-line-item-quantity\">\n						{{item.quantity}}\n					</td>\n\n					<td class=\"order-line-item-price\">\n						<span ng-show=\"item.type === \'coupon\'\">-</span>{{item.price | currency}}				\n					</td>\n\n					<td class=\"order-line-item-remove-area\">\n						<button type=\"button\"\n								class=\"btn btn-danger btn-xs\"\n								ng-disabled=\"item.type === \'serviceMethod\'\"\n							  	ng-click=\"modifyLineItemQuantity(item)\"><span class=\"glyphicon glyphicon-trash\"></span></button>\n					</td>\n				</tr>\n			</tbody>\n		</table>\n	</div>\n</div>\n\n<div class=\"row\">\n	<div class=\"col-md-12\">\n		<p>\n			<strong>Total</strong>: {{order.total | currency}}\n		</p>\n	</div>\n</div>\n\n<div class=\"row\">\n	<div class=\"col-md-6\">\n		<button type=\"button\"\n				ng-disabled=\"!orderIsValid\"\n				ng-click=\"emptyCart()\"\n				class=\"btn btn-default\"><span class=\"glyphicon glyphicon-trash\"></span> Empty Cart</button>\n	</div>\n\n	<div class=\"col-md-6\">\n		<button type=\"button\"\n				ng-disabled=\"!orderIsValid\"\n				class=\"btn btn-success pull-right\"><span class=\"glyphicon glyphicon-lock\"></span> Secure Checkout</button>\n	</div>\n</div>");
$templateCache.put("./public/build/order-form/partials/_pies.html","<h4>Pies <small>Better to have too much than not enough!</small></h4>\n\n<table class=\"table table-striped table-bordered\">\n	<thead>\n		<tr>\n			<th>Size</th>\n			<th></th>\n		</tr>\n	</thead>\n	<tbody>\n		<tr ng-repeat=\"size in pieSizes\">\n			<td>\n				{{size.name}} &mdash; {{size.price|currency}}\n\n				<p><em>{{size.description}}</em></p>\n				<p class=\"help-block\" ng-show=\"size.maxQuantity > 0\">Limit {{size.maxQuantity}} per order</p>\n			</td>\n\n			<td>\n				<button type=\"button\"\n						class=\"btn btn-info\"\n						ng-disabled=\"size.quantity === size.maxQuantity\"\n						ng-click=\"addLineItem(size)\"><span class=\"glyphicon glyphicon-plus\"></span> Add to order</button>\n			</td>\n		</tr>\n	</tbody>\n</table>\n");
$templateCache.put("./public/build/order-form/partials/_service-methods.html","<h4>Service Method <small>Come and get it, or we can bring it to you!</small></h4>\n\n<div class=\"radio\" \n	 ng-repeat=\"method in settings.serviceMethods | orderBy: \'name\'\">\n	<label>\n		<input type=\"radio\"\n			   name=\"serviceMethod\"\n			   ng-model=\"order.deliveryMethod\"\n			   ng-change=\"onDeliveryMethodChanged(method)\"\n			   value=\"{{method.code}}\"> {{method.name}}\n	</label>\n</div>");
$templateCache.put("./public/build/order-form/partials/_sides.html","<h4>Side Items <small>Enhance your order.</small></h4>\n\n<table class=\"table table-striped table-bordered\">\n	<thead>\n		<tr>\n			<th>Name</th>\n			<th>Price</th>\n			<th></th>\n		</tr>\n	</thead>\n	<tbody>\n		<tr ng-repeat=\"item in sideItems\">\n			<td>\n				{{item.name}}\n\n				<p class=\"help-block\">{{item.description}}</p>\n\n				<p class=\"help-block\" ng-show=\"item.maxQuantity > 0\">Limit {{item.maxQuantity}} per order</p>\n			</td>\n\n			<td>\n				{{item.price | currency}}\n			</td>\n\n			<td>\n				<button type=\"button\"\n						class=\"btn btn-info\"\n						ng-disabled=\"item.quantity === item.maxQuantity\"\n						ng-click=\"addLineItem(item)\"><span class=\"glyphicon glyphicon-plus\"></span> Add to order</button>\n			</td>\n		</tr>\n	</tbody>\n</table>");
$templateCache.put("./public/build/order-form/partials/_toppings.html","<h4>Artisan Toppings <small>Gluten-free</small></h4>\n\n<div class=\"row\">\n	<div class=\"col-md-6\">\n		<strong>Meat</strong>\n\n		<div class=\"checkbox\" \n			 ng-repeat=\"topping in toppings.meat | orderBy:\'name\'\">\n			<label class=\"topping-label\">\n				<input type=\"checkbox\"\n					   name=\"toppings\"\n					   id=\"item-{{topping.id}}\"\n					   value=\"{{topping.id}}\"\n					   checklist-value=\"topping\"\n					   checklist-model=\"order.items\"> {{topping.name}} <em>{{topping.price|currency}}</em>\n\n					   <p><em>{{topping.description}}</em></p>\n			</label>\n		</div>\n	</div>\n\n	<div class=\"col-md-6\">\n		<strong>Non-Meat</strong>\n\n		<div class=\"checkbox\" \n			 ng-repeat=\"topping in toppings.nonMeat | orderBy:\'name\'\">\n			<label class=\"topping-label\">\n				<input type=\"checkbox\"\n					   name=\"toppings\"\n					   id=\"item-{{topping.id}}\"\n					   value=\"{{topping.id}}\"\n					   checklist-value=\"topping\"\n					   checklist-model=\"order.items\"> {{topping.name}} <em>{{topping.price|currency}}</em>\n\n					   <p><em>{{topping.description}}</em></p>\n			</label>\n		</div>\n	</div>\n</div>");}]);