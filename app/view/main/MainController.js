/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 */
Ext.define("MyApp.view.main.MainController", {
  extend: "Ext.app.ViewController",

  alias: "controller.main",

  onLogoutClick: function () {
    localStorage.removeItem("MyAppLoggedIn");
    const loginWindow = Ext.create("MyApp.view.login.Login");
    const form = loginWindow.down("form").getForm();
    form.reset();
    this.getView().destroy();
  },

  onProductsClick: function () {
    const tabPanel = this.getView();
    const productsTab = tabPanel.down("productslist");

    if (!productsTab) {
      productsTab = tabPanel.add({
        xtype: "productslist",
        closable: true,
      });
    }

    tabPanel.setActiveTab(productsTab);
  },
  onConfirm: function (choice) {
    if (choice === "yes") {
      //
    }
  },
});
