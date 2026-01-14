// Конфигурация магазина
const CONFIG = {
    TELEGRAM_BOT_TOKEN: '8470666356:AAHWcLZClwqasPeZwoXbzXDjXMjAkefccVA',
    TELEGRAM_CHAT_ID: '-1003643195141',
    YOOMONEY_WALLET: '4100119450984155',
    
    // ⚠️ ТЕСТОВЫЙ РЕЖИМ - поставь true для тестирования без оплаты
    TEST_MODE: true,
    TEST_PRICE: 1, // Цена для теста (1 рубль)
    
    PLANS: {
        premium: { name: 'Premium', price: 120, badge: '⭐ Premium' },
        vip: { name: 'VIP', price: 240, badge: '👑 VIP' },
        christmas: { name: 'Christmas', price: 450, badge: '🎄 Christmas' }
    }
};

// Глобальные переменные
let selectedPlan = null;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initChristmasTimer();
    
    // Показываем тестовый режим если включен
    if (CONFIG.TEST_MODE) {
        showTestModeNotification();
    }
});

// Инициализация обработчиков событий
function initEventListeners() {
    // Кнопки покупки
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            selectedPlan = e.currentTarget.dataset.plan;
            const price = CONFIG.TEST_MODE ? CONFIG.TEST_PRICE : e.currentTarget.dataset.price;
            openPurchaseModal(selectedPlan, price);
        });
    });

    // Закрытие модалки
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    // Отправка формы
    document.getElementById('submitBtn').addEventListener('click', processPayment);

    // Закрытие по клику вне модалки
    document.getElementById('purchaseModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('purchaseModal')) closeModal();
    });

    // Нажатие Enter в поле username
    document.getElementById('telegramUsername').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            processPayment();
        }
    });
}

// Показать уведомление о тестовом режиме
function showTestModeNotification() {
    const notification = document.createElement('div');
    notification.className = 'test-mode-notification';
    notification.innerHTML = `
        <div class="test-mode-content">
            <i class="fas fa-flask"></i>
            <div>
                <strong>🔧 ТЕСТОВЫЙ РЕЖИМ</strong>
                <p>Оплата не требуется! Для теста цена: ${CONFIG.TEST_PRICE} ₽</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Стили для уведомления
    const style = document.createElement('style');
    style.textContent = `
        .test-mode-notification {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ff9900, #ff6600);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 10001;
            box-shadow: 0 5px 20px rgba(255, 102, 0, 0.3);
            animation: slideDown 0.5s ease;
        }
        
        .test-mode-content {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .test-mode-content i {
            font-size: 24px;
        }
        
        .test-mode-content strong {
            font-size: 14px;
            display: block;
            margin-bottom: 5px;
        }
        
        .test-mode-content p {
            font-size: 13px;
            margin: 0;
            opacity: 0.9;
        }
        
        @keyframes slideDown {
            from { top: -100px; opacity: 0; }
            to { top: 20px; opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// Открытие модалки покупки
function openPurchaseModal(plan, price) {
    selectedPlan = plan;
    
    // Обновляем информацию
    document.getElementById('selectedPlanName').textContent = CONFIG.PLANS[plan].name;
    
    // Показываем тестовую цену если включен режим
    if (CONFIG.TEST_MODE) {
        document.getElementById('selectedPlanPrice').innerHTML = `
            ${price} ₽ <span class="test-price-badge">ТЕСТ</span>
        `;
    } else {
        document.getElementById('selectedPlanPrice').textContent = `${price} ₽`;
    }
    
    // Сбрасываем поле
    document.getElementById('telegramUsername').value = '';
    
    // Обновляем текст кнопки если тестовый режим
    if (CONFIG.TEST_MODE) {
        document.getElementById('submitBtn').innerHTML = `
            <i class="fas fa-flask"></i> Протестировать покупку
        `;
    }
    
    // Показываем модалку
    document.getElementById('purchaseModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Фокус на поле ввода
    setTimeout(() => {
        document.getElementById('telegramUsername').focus();
    }, 300);
}

// Обработка платежа
function processPayment() {
    const username = document.getElementById('telegramUsername').value.trim();
    
    // Валидация
    if (!validateTelegramUsername(username)) {
        showError('Введите корректный Telegram @username (5-32 символа, только английские буквы, цифры и _)');
        return;
    }
    
    // Если тестовый режим - имитируем оплату
    if (CONFIG.TEST_MODE) {
        simulateTestPayment(username);
    } else {
        // Реальный режим - перенаправляем на оплату
        const paymentUrl = createYooMoneyPaymentLink(username);
        window.location.href = paymentUrl;
    }
}

// Имитация тестовой оплаты
function simulateTestPayment(username) {
    const plan = CONFIG.PLANS[selectedPlan];
    const paymentComment = generatePaymentComment(username);
    
    // Показываем окно симуляции
    showTestPaymentSimulation(username, plan, paymentComment);
}

// Показать симуляцию оплаты
function showTestPaymentSimulation(username, plan, paymentId) {
    // Создаем модалку симуляции
    const modal = document.createElement('div');
    modal.className = 'test-payment-modal';
    modal.innerHTML = `
        <div class="test-payment-content">
            <div class="test-header">
                <i class="fas fa-flask"></i>
                <h3>Тестовая оплата</h3>
            </div>
            
            <div class="test-info">
                <div class="info-row">
                    <span>Тариф:</span>
                    <strong>${plan.name}</strong>
                </div>
                <div class="info-row">
                    <span>Для пользователя:</span>
                    <strong>@${username}</strong>
                </div>
                <div class="info-row">
                    <span>Тестовая цена:</span>
                    <strong>${CONFIG.TEST_PRICE} ₽</strong>
                </div>
                <div class="info-row">
                    <span>ID транзакции:</span>
                    <code>${paymentId}</code>
                </div>
            </div>
            
            <div class="simulation-steps">
                <div class="step" id="step1">
                    <div class="step-icon">1</div>
                    <div class="step-text">Симуляция перехода на ЮMoney...</div>
                    <div class="step-loader"></div>
                </div>
                <div class="step" id="step2">
                    <div class="step-icon">2</div>
                    <div class="step-text">Имитация оплаты...</div>
                    <div class="step-loader"></div>
                </div>
                <div class="step" id="step3">
                    <div class="step-icon">3</div>
                    <div class="step-text">Проверка платежа...</div>
                    <div class="step-loader"></div>
                </div>
                <div class="step" id="step4">
                    <div class="step-icon">4</div>
                    <div class="step-text">Выдача статуса в Telegram...</div>
                    <div class="step-loader"></div>
                </div>
            </div>
            
            <div class="test-buttons">
                <button class="btn-secondary" id="cancelTestBtn">Отмена</button>
                <button class="btn-primary" id="startTestBtn">
                    <i class="fas fa-play"></i> Запустить тест
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Стили для тестовой модалки
    const style = document.createElement('style');
    style.textContent = `
        .test-payment-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2001;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        }
        
        .test-payment-content {
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            animation: scaleIn 0.3s ease;
        }
        
        .test-header {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .test-header i {
            font-size: 60px;
            color: #ff9900;
            margin-bottom: 15px;
        }
        
        .test-header h3 {
            font-family: 'Montserrat', sans-serif;
            font-size: 24px;
            color: #1a1a2e;
        }
        
        .test-info {
            background: #f8faff;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e6f0ff;
        }
        
        .info-row:last-child {
            border-bottom: none;
        }
        
        .simulation-steps {
            margin: 25px 0;
        }
        
        .step {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: white;
            border-radius: 10px;
            margin-bottom: 10px;
            border: 2px solid #e6f0ff;
            transition: all 0.3s ease;
        }
        
        .step.active {
            border-color: #0066ff;
            background: #f0f7ff;
        }
        
        .step.completed {
            border-color: #4cd964;
            background: #e6ffe6;
        }
        
        .step-icon {
            width: 30px;
            height: 30px;
            background: #e6f0ff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            color: #666;
        }
        
        .step.active .step-icon {
            background: #0066ff;
            color: white;
        }
        
        .step.completed .step-icon {
            background: #4cd964;
            color: white;
        }
        
        .step-text {
            flex: 1;
            font-size: 14px;
        }
        
        .step-loader {
            width: 20px;
            height: 20px;
            border: 2px solid #e6f0ff;
            border-top-color: #0066ff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: none;
        }
        
        .step.active .step-loader {
            display: block;
        }
        
        .step.completed .step-loader {
            display: none;
        }
        
        .test-buttons {
            display: flex;
            gap: 15px;
            margin-top: 25px;
        }
        
        .test-buttons button {
            flex: 1;
            padding: 15px;
            border-radius: 10px;
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
        }
        
        #startTestBtn {
            background: linear-gradient(135deg, #0066ff 0%, #00b8ff 100%);
            color: white;
        }
        
        #cancelTestBtn {
            background: white;
            color: #666;
            border: 2px solid #e6f0ff;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .test-price-badge {
            display: inline-block;
            background: #ff9900;
            color: white;
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 11px;
            margin-left: 8px;
            vertical-align: middle;
        }
    `;
    document.head.appendChild(style);
    
    // Обработчики для тестовой модалки
    document.getElementById('startTestBtn').addEventListener('click', () => {
        startTestSimulation(username, plan, paymentId);
    });
    
    document.getElementById('cancelTestBtn').addEventListener('click', () => {
        modal.remove();
        style.remove();
    });
    
    // Закрытие по клику вне модалки
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            style.remove();
        }
    });
}

// Запуск тестовой симуляции
async function startTestSimulation(username, plan, paymentId) {
    const startBtn = document.getElementById('startTestBtn');
    const cancelBtn = document.getElementById('cancelTestBtn');
    
    // Блокируем кнопки
    startBtn.disabled = true;
    cancelBtn.disabled = true;
    startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Тестирование...';
    
    // Шаг 1: Переход на оплату
    await simulateStep(1, 1500);
    
    // Шаг 2: Имитация оплаты
    await simulateStep(2, 2000);
    
    // Шаг 3: Проверка платежа
    await simulateStep(3, 1500);
    
    // Шаг 4: Выдача статуса
    await simulateStep(4, 2000);
    
    // Показываем успех
    setTimeout(() => {
        showTestSuccessModal(username, plan, paymentId);
        
        // Закрываем симуляцию
        const modal = document.querySelector('.test-payment-modal');
        const style = document.querySelector('style[data-test-style]');
        if (modal) modal.remove();
        if (style) style.remove();
        
        // Закрываем основную модалку
        closeModal();
    }, 1000);
}

// Симуляция шага
async function simulateStep(stepNumber, duration) {
    const step = document.getElementById(`step${stepNumber}`);
    step.classList.add('active');
    
    // Ждем
    await new Promise(resolve => setTimeout(resolve, duration));
    
    // Отмечаем как выполненный
    step.classList.remove('active');
    step.classList.add('completed');
    
    // Меняем иконку на галочку
    const stepIcon = step.querySelector('.step-icon');
    stepIcon.innerHTML = '<i class="fas fa-check"></i>';
}

// Показать успешное завершение теста
function showTestSuccessModal(username, plan, paymentId) {
    const modal = document.createElement('div');
    modal.className = 'test-success-modal';
    modal.innerHTML = `
        <div class="test-success-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            
            <h3>✅ Тест завершен успешно!</h3>
            
            <div class="success-info">
                <p><strong>В реальном режиме произошло бы:</strong></p>
                <ul>
                    <li>Пользователь @${username} перешел бы на страницу оплаты ЮMoney</li>
                    <li>Оплатил бы ${plan.price} ₽ за статус "${plan.name}"</li>
                    <li>После оплаты бот выдал бы статус в Telegram группе</li>
                    <li>Статус отобразился бы как "${plan.badge}"</li>
                </ul>
            </div>
            
            <div class="test-data">
                <div class="data-row">
                    <span>Тестовый ID транзакции:</span>
                    <code>${paymentId}</code>
                </div>
                <div class="data-row">
                    <span>Реальная цена:</span>
                    <strong>${plan.price} ₽</strong>
                </div>
                <div class="data-row">
                    <span>Тестовая цена:</span>
                    <strong>${CONFIG.TEST_PRICE} ₽</strong>
                </div>
            </div>
            
            <div class="test-actions">
                <button class="btn-secondary" id="closeTestSuccessBtn">
                    <i class="fas fa-times"></i> Закрыть
                </button>
                <button class="btn-primary" id="disableTestModeBtn">
                    <i class="fas fa-power-off"></i> Отключить тестовый режим
                </button>
            </div>
            
            <div class="test-note">
                <i class="fas fa-info-circle"></i>
                <p>Для реальных покупок поменяйте <code>TEST_MODE: true</code> на <code>TEST_MODE: false</code> в script.js</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Стили для успешной модалки
    const style = document.createElement('style');
    style.textContent = `
        .test-success-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2001;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        }
        
        .test-success-content {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            text-align: center;
            animation: scaleIn 0.3s ease;
        }
        
        .success-icon {
            font-size: 80px;
            color: #4cd964;
            margin-bottom: 20px;
            animation: bounce 1s ease;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        
        .test-success-content h3 {
            font-family: 'Montserrat', sans-serif;
            font-size: 28px;
            margin-bottom: 25px;
            color: #1a1a2e;
        }
        
        .success-info {
            background: #f8faff;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
        
        .success-info p {
            font-weight: 600;
            margin-bottom: 15px;
            color: #1a1a2e;
        }
        
        .success-info ul {
            margin-left: 20px;
            margin-bottom: 0;
        }
        
        .success-info li {
            margin-bottom: 10px;
            color: #666;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .test-data {
            background: #fff8e1;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
        
        .data-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #ffeaa7;
        }
        
        .data-row:last-child {
            border-bottom: none;
        }
        
        .test-actions {
            display: flex;
            gap: 15px;
            margin: 25px 0;
        }
        
        .test-actions button {
            flex: 1;
            padding: 15px;
            border-radius: 10px;
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
        }
        
        #disableTestModeBtn {
            background: linear-gradient(135deg, #0066ff 0%, #00b8ff 100%);
            color: white;
        }
        
        #closeTestSuccessBtn {
            background: white;
            color: #666;
            border: 2px solid #e6f0ff;
        }
        
        .test-note {
            background: #e6f7ff;
            border-radius: 10px;
            padding: 15px;
            margin-top: 20px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            text-align: left;
        }
        
        .test-note i {
            color: #0066ff;
            margin-top: 3px;
        }
        
        .test-note p {
            font-size: 13px;
            margin: 0;
            color: #1a1a2e;
        }
        
        .test-note code {
            background: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #0066ff;
        }
    `;
    document.head.appendChild(style);
    
    // Обработчики
    document.getElementById('closeTestSuccessBtn').addEventListener('click', () => {
        modal.remove();
        style.remove();
    });
    
    document.getElementById('disableTestModeBtn').addEventListener('click', () => {
        alert('Чтобы отключить тестовый режим, измените в файле script.js:\nTEST_MODE: true → TEST_MODE: false');
        modal.remove();
        style.remove();
    });
    
    // Закрытие по клику вне модалки
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            style.remove();
        }
    });
}

// Создание ссылки для оплаты ЮMoney (для реального режима)
function createYooMoneyPaymentLink(username) {
    const plan = CONFIG.PLANS[selectedPlan];
    const paymentComment = generatePaymentComment(username);
    
    const params = new URLSearchParams({
        receiver: CONFIG.YOOMONEY_WALLET,
        'quickpay-form': 'shop',
        targets: `FelixShop: ${plan.name} статус для @${username}`,
        'paymentType': 'AC',
        sum: plan.price,
        label: paymentComment,
        'successURL': window.location.origin + '/success.html?' + 
                      new URLSearchParams({
                          plan: plan.name,
                          amount: plan.price,
                          username: username,
                          id: paymentComment
                      }).toString(),
        'need-fio': 'false',
        'need-email': 'false',
        'need-phone': 'false',
        'need-address': 'false'
    });
    
    return `https://yoomoney.ru/quickpay/confirm?${params.toString()}`;
}

// Таймер Christmas
function initChristmasTimer() {
    updateChristmasTimer();
    setInterval(updateChristmasTimer, 1000);
}

function updateChristmasTimer() {
    const targetDate = new Date('2026-01-21T23:59:59');
    const now = new Date();
    const diff = targetDate - now;
    
    if (diff <= 0) {
        document.getElementById('timerText').textContent = 'Акция завершена';
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('timerText').textContent = `${days}д ${hours}ч ${minutes}м`;
}

// Валидация Telegram username
function validateTelegramUsername(username) {
    const regex = /^[a-zA-Z0-9_]{5,32}$/;
    return regex.test(username);
}

// Генерация комментария для платежа
function generatePaymentComment(username) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `FELIX_${selectedPlan.toUpperCase()}_${username}_${random}`;
}

// Показать ошибку
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
    
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4757;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 15px rgba(255, 71, 87, 0.3);
        max-width: 400px;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

// Закрытие модалки
function closeModal() {
    document.getElementById('purchaseModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Добавляем стили для анимаций ошибок
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Плавная прокрутка для якорей
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.getAttribute('href') === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});
