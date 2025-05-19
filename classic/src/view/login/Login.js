Ext.define("MyApp.view.login.Login", {
  extend: "Ext.window.Window",
  xtype: "loginwindow",

  requires: ["Ext.form.Panel", "MyApp.view.login.LoginController"],

  controller: "login",

  title: "Вход в систему",
  width: 400,
  height: 250,
  closable: false,
  autoShow: true,
  modal: true,

  items: [
    {
      xtype: "form",
      reference: "form",
      bodyPadding: 15,
      defaults: {
        xtype: "textfield",
        allowBlank: false,
        margin: "5 0",
      },
      items: [
        {
          fieldLabel: "Логин",
          name: "username",
          emptyText: "Введите логин",
        },
        {
          fieldLabel: "Пароль",
          name: "password",
          inputType: "password",
          emptyText: "Введите пароль",
        },
      ],
    },
  ],

  buttons: [
    {
      text: "Войти",
      formBind: true,
      handler: "onLoginClick",
    },
  ],
});
