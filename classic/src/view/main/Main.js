/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define("MyApp.view.main.Main", {
  extend: "Ext.tab.Panel",
  title: "Главное окно",
  xtype: "app-main",
  renderTo: Ext.getBody(),
  requires: [
    "Ext.plugin.Viewport",
    "Ext.window.MessageBox",
    "MyApp.view.main.MainController",
    "MyApp.view.main.MainModel",
    "MyApp.view.main.Products",
  ],

  controller: "main",
  viewModel: "main",

  dockedItems: [
    {
      xtype: "toolbar",
      dock: "top",
      items: [
        {
          text: "Товары",
          handler: "onProductsClick",
        },
        {
          text: "Выход",
          handler: "onLogoutClick",
        },
      ],
    },
  ],
});
