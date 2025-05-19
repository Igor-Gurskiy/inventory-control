Ext.define("MyApp.view.product.Card", {
  extend: "Ext.window.Window",
  xtype: "productcard",
  width: 400,
  modal: true,
  layout: "fit",

  items: [
    {
      xtype: "form",
      bodyPadding: 10,
      defaults: {
        xtype: "textfield",
        anchor: "100%",
        labelWidth: 120,
        allowBlank: false,
      },
      items: [
        {
          xtype: "displayfield",
          fieldLabel: "ID",
          name: "id",
        },
        {
          xtype: "displayfield",
          fieldLabel: "Описание",
          name: "description",
        },
        {
          fieldLabel: "Цена",
          name: "price",
          xtype: "numberfield",
          minValue: 0,
          decimalPrecision: 2,
          allowDecimals: true,
          enforceMaxLength: true,
          msgTarget: "under",
          validator: function (value) {
            return value >= 0 ? true : "Цена не может быть отрицательной";
          },
        },
        {
          fieldLabel: "Кол-во",
          name: "amount",
          xtype: "numberfield",
          minValue: 0,
          allowDecimals: false,
          enforceMaxLength: true,
          validator: function (value) {
            return value >= 0 ? true : "Количество не может быть отрицательным";
          },
        },
      ],
      buttons: [
        {
          text: "Сохранить",
          handler: function () {
            var form = this.up("form"),
              record = form.getRecord(),
              values = form.getValues();

            if (form.isValid()) {
              record.set(values);
              record.save();
              this.up("window").close();
            }
          },
        },
        {
          text: "Отмена",
          handler: function () {
            this.up("window").close();
          },
        },
      ],
    },
  ],

  initComponent: function () {
    this.callParent();
    this.down("form").loadRecord(this.record);
  },
});
