Ext.define("MyApp.store.Products", {
  extend: "Ext.data.Store",

  alias: "store.products",

  model: "MyApp.model.Product",

  data: {
    items: [
      {
        id: 1,
        name: "Phone X",
        description: "Смартфон последнего поколения",
        price: 799,
        amount: 15,
      },
      {
        id: 2,
        name: "Tablet Pro",
        description: "Планшет с высоким разрешением экрана",
        price: 449,
        amount: 8,
      },
      {
        id: 3,
        name: "Laptop Elite",
        description: "Мощный ноутбук для работы и игр",
        price: 1299,
        amount: 0,
      },
      {
        id: 4,
        name: 'Monitor 27"',
        description: "Монитор с IPS матрицей",
        price: 299,
        amount: 12,
      },
      {
        id: 5,
        name: "Desktop Pro",
        description: "Стационарный компьютер",
        price: 899,
        amount: 7,
      },
      {
        id: 6,
        name: "Wireless Mouse",
        description: "Беспроводная мышь",
        price: 25,
        amount: 32,
      },
      {
        id: 7,
        name: "Keyboard RGB",
        description: "Механическая клавиатура с подсветкой",
        price: 89,
        amount: 14,
      },
      {
        id: 8,
        name: "Headphones Pro",
        description: "Наушники с шумоподавлением",
        price: 199,
        amount: 9,
      },
      {
        id: 9,
        name: "Smart Watch",
        description: "Умные часы с трекингом здоровья",
        price: 159,
        amount: 18,
      },
      {
        id: 10,
        name: "SSD 1TB",
        description: "Твердотельный накопитель",
        price: 129,
        amount: 22,
      },
      {
        id: 11,
        name: "HDD 2TB",
        description: "Жесткий диск",
        price: 69,
        amount: 16,
      },
      {
        id: 12,
        name: "USB Flash 64GB",
        description: "Флеш-накопитель",
        price: 19,
        amount: 45,
      },
      {
        id: 13,
        name: "Webcam HD",
        description: "Веб-камера с микрофоном",
        price: 49,
        amount: 11,
      },
      {
        id: 14,
        name: "Router WiFi 6",
        description: "Беспроводной маршрутизатор",
        price: 149,
        amount: 6,
      },
      {
        id: 15,
        name: "Printer Laser",
        description: "Лазерный принтер",
        price: 179,
        amount: 4,
      },
      {
        id: 16,
        name: "External Battery",
        description: "Внешний аккумулятор 10000mAh",
        price: 39,
        amount: 27,
      },
      {
        id: 17,
        name: "Docking Station",
        description: "Док-станция для ноутбука",
        price: 89,
        amount: 8,
      },
      {
        id: 18,
        name: "Graphics Card",
        description: "Видеокарта игровая",
        price: 499,
        amount: 3,
      },
      {
        id: 19,
        name: "RAM 16GB",
        description: "Оперативная память DDR4",
        price: 79,
        amount: 19,
      },
      {
        id: 20,
        name: "CPU Cooler",
        description: "Кулер для процессора",
        price: 45,
        amount: 13,
      },
      {
        id: 21,
        name: "Power Supply",
        description: "Блок питания 650W",
        price: 89,
        amount: 7,
      },
      {
        id: 22,
        name: "Gaming Chair",
        description: "Игровое кресло",
        price: 249,
        amount: 5,
      },
      {
        id: 23,
        name: "LED Strip",
        description: "Светодиодная лента RGB",
        price: 29,
        amount: 36,
      },
      {
        id: 24,
        name: "Smart Speaker",
        description: "Умная колонка с голосовым помощником",
        price: 99,
        amount: 14,
      },
      {
        id: 25,
        name: "E-Reader",
        description: "Электронная книга",
        price: 119,
        amount: 9,
      },
      {
        id: 26,
        name: "Fitness Tracker",
        description: "Фитнес-браслет",
        price: 59,
        amount: 23,
      },
      {
        id: 27,
        name: "VR Headset",
        description: "Виртуальная реальность",
        price: 299,
        amount: 4,
      },
      {
        id: 28,
        name: "Drone Pro",
        description: "Квадрокоптер с камерой",
        price: 399,
        amount: 3,
      },
      {
        id: 29,
        name: "Action Camera",
        description: "Экшн-камера 4K",
        price: 199,
        amount: 7,
      },
      {
        id: 30,
        name: "Tripod",
        description: "Штатив для камеры",
        price: 49,
        amount: 18,
      },
      {
        id: 31,
        name: "Microphone",
        description: "Студийный микрофон",
        price: 89,
        amount: 6,
      },
      {
        id: 32,
        name: "Audio Interface",
        description: "Аудиоинтерфейс для записи",
        price: 149,
        amount: 4,
      },
      {
        id: 33,
        name: "MIDI Keyboard",
        description: "MIDI-контроллер",
        price: 129,
        amount: 5,
      },
      {
        id: 34,
        name: "Studio Monitors",
        description: "Студийные мониторы",
        price: 299,
        amount: 0,
      },
      {
        id: 35,
        name: "DJ Controller",
        description: "Контроллер для диджеинга",
        price: 349,
        amount: 2,
      },
      {
        id: 36,
        name: "Turntable",
        description: "Проигрыватель винила",
        price: 199,
        amount: 4,
      },
      {
        id: 37,
        name: "Projector",
        description: "Мультимедийный проектор",
        price: 399,
        amount: 3,
      },
      {
        id: 38,
        name: "Ethernet Cable",
        description: "Сетевой кабель 10м",
        price: 12,
        amount: 58,
      },
      {
        id: 39,
        name: "HDMI Cable",
        description: "Кабель HDMI 2.0",
        price: 15,
        amount: 42,
      },
      {
        id: 40,
        name: "USB Hub",
        description: "USB-концентратор 4 порта",
        price: 19,
        amount: 27,
      },
      {
        id: 41,
        name: "Laptop Stand",
        description: "Подставка для ноутбука",
        price: 29,
        amount: 19,
      },
      {
        id: 42,
        name: "Screen Protector",
        description: "Защитное стекло для смартфона",
        price: 9,
        amount: 84,
      },
      {
        id: 43,
        name: "Phone Case",
        description: "Чехол для телефона",
        price: 15,
        amount: 63,
      },
      {
        id: 44,
        name: "Car Charger",
        description: "Автомобильное зарядное устройство",
        price: 19,
        amount: 0,
      },
    ],
  },

  proxy: {
    type: "memory",
    reader: {
      type: "json",
      rootProperty: "items",
    },
    enablePaging: true,
  },
  pageSize: 10,
  remoteFilter: false,
  remoteSort: false,
});
