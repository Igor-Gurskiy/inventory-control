Ext.define("MyApp.view.login.LoginController", {
  extend: "Ext.app.ViewController",
  alias: "controller.login",

  onLoginClick: function () {
    var form = this.lookupReference("form"),
      values = form.getValues(),
      userStore = Ext.getStore("Users"),
      user = userStore.findRecord("username", values.username);

    if (user && user.get("password") === values.password) {
      var loginWindow = this.getView();
      localStorage.setItem("MyAppLoggedIn", true);
      if (loginWindow && !loginWindow.isDestroyed) {
        loginWindow.close();
      }
      Ext.create("MyApp.view.main.Main", {
        renderTo: Ext.getBody(),
      });
    } else {
      Ext.Msg.alert("Ошибка", "Неверный логин или пароль");
    }
  },
});
