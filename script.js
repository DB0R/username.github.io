document.addEventListener('DOMContentLoaded', () => {
    // --- نظام حماية الدخول للمحرر (Admin Access) ---
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    const adminKey = '12345';
    const editorContainer = document.getElementById('diet-plan-container');

    // إذا كان المستخدم يحاول فتح المحرر (index.html)
    if (editorContainer) {
        if (userParam !== adminKey) {
            // تحويل أي شخص لا يملك الرابط السري إلى صفحة التطبيق
            window.location.href = 'app.html';
            return; // إيقاف تشغيل باقي الكود
        }
    }

    const addDayButton = document.getElementById('add-day-button');
    const deleteAllButton = document.getElementById('delete-all-button');
    const saveButton = document.getElementById('save-button');
    const loadPlanButton = document.getElementById('load-plan-button');
    const planFileInput = document.getElementById('plan-file-input');
    const modeToggleButton = document.getElementById('mode-toggle-btn');
    const planTypeSelector = document.getElementById('plan-type-selector');
    const daysContainer = document.getElementById('days-container');
    let dayCounter = 0;

    // قائمة الحقول الغذائية المتاحة
    const nutritionFields = {
        calories: { label: 'سعرات', unit: '', icon: '🔥' },
        protein: { label: 'بروتين', unit: 'جرام', icon: '💪' },
        carbs: { label: 'كارب', unit: 'جرام', icon: '⚡' },
        fats: { label: 'دهون', unit: 'جرام', icon: '🧈' },
        fiber: { label: 'ألياف', unit: 'جرام', icon: '🌾' },
        sugar: { label: 'سكريات', unit: 'جرام', icon: '🍯' }
    };

    const workoutFields = {
        weight: { label: 'الوزن', unit: 'كجم', icon: '⚖️' },
        reps: { label: 'العدادات', unit: '', icon: '🔢' },
        sets: { label: 'المجاميع', unit: '', icon: '📊' }
    };


    /**
     * إنشاء قسم وجبة جديد.
     */
    const createMealBlock = () => {
        const planType = planTypeSelector.value;
        const mealBlock = document.createElement('div');
        mealBlock.className = 'meal-block';

        const title = planType === 'diet' ? 'عنوان الوجبة' : 'اسم التمرين';
        const content = planType === 'diet' ? 'أدخل تفاصيل الوجبة...' : 'أدخل ملاحظات التمرين...';
        let detailsHtml = '';

        if (planType === 'diet') {
            document.querySelectorAll('#nutrition-fields-checkboxes input:checked').forEach(checkbox => {
                const fieldKey = checkbox.dataset.field;
                const field = nutritionFields[fieldKey];
                detailsHtml += `<span data-field="${fieldKey}"><strong>${field.icon || ''} ${field.label}:</strong> <span contenteditable="true">0</span> ${field.unit}</span>`;
            });
        } else { // workout
            Object.entries(workoutFields).forEach(([key, field]) => {
                detailsHtml += `<span class="workout-field"><strong>${field.icon || ''} ${field.label}:</strong> <span contenteditable="true">0</span> ${field.unit}</span>`;
            });
        }

        mealBlock.innerHTML = `
            <button class="delete-meal-btn" title="حذف الوجبة">🗑️</button>
            <h3 contenteditable="true">${title}</h3>
            <div class="meal-content" contenteditable="true">${content}</div>
            <div class="meal-details">${detailsHtml}</div>
        `;
        return mealBlock;
    };

    /**
     * إنشاء قسم يوم جديد.
     */
    const createDayBlock = () => {
        dayCounter++;
        const dayBlock = document.createElement('div');
        const planType = planTypeSelector.value;
        const addBtnText = planType === 'diet' ? '➕ إضافة وجبة' : '➕ إضافة تمرين';
        const dayTitle = planType === 'diet' ? `اليوم ${dayCounter} - 🍎 تغذية` : `اليوم ${dayCounter} - 💪 تمارين`;
        dayBlock.className = 'day-block';
        dayBlock.innerHTML = `
            <div class="day-header">
                <h2 contenteditable="true">${dayTitle}</h2>
                <div class="day-header-buttons">
                    <button class="add-meal-btn">${addBtnText}</button>
                    <button class="delete-day-btn" title="حذف اليوم">🗑️</button>
                </div>
            </div>
            <div class="meals-container">
                <!-- سيتم إضافة الوجبات هنا -->
            </div>
        `;
        return dayBlock;
    };

    /**
     * إضافة يوم جديد إلى الصفحة.
     */
    const addDay = () => {
        const newDay = createDayBlock();
        daysContainer.appendChild(newDay);
    };

    /**
     * حذف جميع الأيام من الصفحة.
     */
    const deleteAllDays = () => {
        if (confirm('هل أنت متأكد من أنك تريد حذف كل شيء؟ لا يمكن التراجع عن هذا الإجراء.')) {
            daysContainer.innerHTML = '';
            dayCounter = 0; // إعادة تعيين العداد
        }
    };

    /**
     * تبديل الوضع بين النهاري والليلي.
     */
    const toggleMode = () => {
        const isDarkMode = modeToggleButton.dataset.mode === 'dark';
        if (isDarkMode) {
            modeToggleButton.dataset.mode = 'light';
            modeToggleButton.innerHTML = 'نهاري ☀️';
        } else {
            modeToggleButton.dataset.mode = 'dark';
            modeToggleButton.innerHTML = 'ليلي 🌙';
        }
    };

    /**
     * تحديث واجهة المستخدم بناءً على نوع الخطة المختار.
     */
    const updateUIForPlanType = () => {
        if (!planTypeSelector) return;

        const planType = planTypeSelector.value;
        const mainHeader = document.querySelector('header h1');
        const mainDescription = document.querySelector('header p.description');
        const addDayBtn = document.getElementById('add-day-button');
        const nutritionFieldsContainer = document.getElementById('nutrition-fields-container');

        if (planType === 'workout') {
            if (mainHeader) mainHeader.textContent = 'جدول النظام التدريبي';
            if (mainDescription) mainDescription.textContent = 'قم ببناء خطتك التدريبية بإضافة التمارين لكل يوم.';
            addDayBtn.textContent = '➕ إضافة يوم تدريبي';
            nutritionFieldsContainer.style.display = 'none'; // إخفاء حقول التغذية
        } else { // diet
            if (mainHeader) mainHeader.textContent = 'جدول النظام الغذائي';
            if (mainDescription) mainDescription.textContent = 'قم ببناء خطتك الغذائية بإضافة الأيام والوجبات بشكل ديناميكي.';
            addDayBtn.textContent = '➕ إضافة يوم';
            nutritionFieldsContainer.style.display = 'block'; // إظهار حقول التغذية
        }

        // تحديث أزرار الإضافة فقط في الأيام الموجودة دون المساس بالمحتوى
        document.querySelectorAll('.day-block').forEach(dayBlock => {
            const addMealBtn = dayBlock.querySelector('.add-meal-btn');
            if (addMealBtn) {
                addMealBtn.textContent = planType === 'diet' ? '➕ إضافة وجبة' : '➕ إضافة تمرين';
            }
        });
    };

    /**
     * يقوم بإنشاء صناديق الاختيار الخاصة بالحقول الغذائية.
 */
    const populateNutritionFields = () => {
        const container = document.getElementById('nutrition-fields-checkboxes');
        if (!container) return;

        container.innerHTML = ''; // مسح المحتوى القديم

        // حقول مفعلة بشكل افتراضي
        const defaultFields = ['calories', 'protein'];

        for (const key in nutritionFields) {
            const field = nutritionFields[key];
            const isChecked = defaultFields.includes(key);
            const checkboxHtml = `
                <label style="display: inline-flex; align-items: center; gap: 5px; font-size: 1em; cursor: pointer; padding: 5px 10px; border-radius: 5px; background-color: #f0f0f0;">
                    <input type="checkbox" data-field="${key}" ${isChecked ? 'checked' : ''}>
                    ${field.icon || ''} ${field.label}
                </label>
            `;
            container.innerHTML += checkboxHtml;
        }

        // ربط حدث التغيير لتحديث الواجهة فوراً
        container.addEventListener('change', updateUIForPlanType);
    };

    /**
     * يحتوي على جميع أكواد CSS اللازمة للسمات المختلفة وتنسيق الصفحة المحفوظة.
     */
    const getThemeStyles = () => {
        return `
            /* --- الخطوط الأساسية --- */
            body { font-family: 'Cairo', 'Tajawal', sans-serif; transition: background-color 0.3s, color 0.3s; margin: 0; padding: 20px; line-height: 1.6; }
            /* --- تصميم الحاوية الرئيسية --- */
            .container { max-width: 1200px; margin: 20px auto; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); transition: background-color 0.3s; }
            header { text-align: center; margin-bottom: 30px; }
            h1 { font-size: 2.8em; margin-bottom: 10px; }
            p.description { font-size: 1.2em; }
            /* --- تصميم الأيام والوجبات (مشترك) --- */
            #days-container { display: flex; flex-direction: column; gap: 30px; }
            .day-block { border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: background-color 0.3s, border-color 0.3s; }
            .day-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; margin-bottom: 20px; }
            .day-header h2 { margin: 0; font-size: 2em; }
            .meals-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
            .meal-block { border-radius: 6px; padding: 15px; transition: background-color 0.3s, border-color 0.3s; }
            .meal-block [contenteditable="true"] { background-color: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 3px; }

            /* --- تصميم رأس الصفحة (البانر) --- */
            .banner-header {
                padding: 60px 20px;
                text-align: center;
                background-size: cover;
                background-position: center 30%;
                color: white;
                border-radius: 12px;
                margin-bottom: 30px;
            }
            .banner-header h1 { color: white; text-shadow: 0 2px 5px rgba(0,0,0,0.5); }
            .banner-header p.description { color: #f0f0f0; text-shadow: 0 1px 3px rgba(0,0,0,0.5); }

            .meal-block h3 { margin: 0 0 10px 0; font-size: 1.3em; padding-bottom: 8px; }
            .meal-details span { display: block; margin-top: 8px; }

            /* --- تصميم قسم اليوم القابل للطي (في الملف المحفوظ) --- */
            .day-header {
                cursor: pointer;
                position: relative;
                padding-right: 30px; /* مساحة للسهم في اليمين (RTL) */
            }
            .day-header::before {
                content: '▲';
                position: absolute;
                right: 0; /* السهم على اليمين */
                top: 50%;
                transform: translateY(-50%);
                font-size: 0.8em;
                color: var(--accent-color, #3498db);
                transition: transform 0.3s ease;
            }
            .day-block.collapsed .day-header::before {
                transform: translateY(-50%) rotate(180deg);
            }
            .day-block.collapsed .meals-container { display: none; }

            /* --- 🎨 السمات اللونية 🎨 --- */
            /* 1. السمة الافتراضية (أزرق) */
            body.default-light { --accent-color: #3498db; --accent-color-dark: #2980b9; --text-color-headings: #2c3e50; background-color: #f4f7f6; color: #333; }
            .default-light .container { background-color: #ffffff; }
            .default-light .day-block { background: #fff; border: 1px solid #e0e0e0; }
            .default-light .day-header { border-bottom: 2px solid var(--accent-color); }
            .default-light h1, .default-light .day-header h2 { color: var(--text-color-headings); }
            .default-light p.description { color: #7f8c8d; }
            .default-light .meal-block { background: #f9f9f9; border: 1px solid #ddd; }
            .default-light .meal-block h3 { color: #34495e; border-bottom: 1px solid #eee; }
            .default-light .captain-name { color: var(--accent-color); }

            /* 2. نسيم المحيط (أزرق) */
            body.ocean-blue { --accent-color: #0077b6; --accent-color-dark: #023e8a; --text-color-headings: #023e8a; background-color: #eef7ff; color: #2c3e50; }
            .ocean-blue .container { background-color: #ffffff; }
            .ocean-blue .day-header { border-bottom: 2px solid var(--accent-color); }
            .ocean-blue h1, .ocean-blue .day-header h2 { color: var(--text-color-headings); }
            .ocean-blue .meal-block { background: #f0f8ff; border: 1px solid #ade8f4; }
            .ocean-blue .meal-block h3 { color: var(--accent-color); border-bottom: 1px solid #caf0f8; }
            .ocean-blue .signature-footer { background-color: #f0f8ff; border-top-color: #ade8f4; }
            .ocean-blue .captain-name { color: var(--accent-color-dark); }

            /* 3. هدوء الغابة (أخضر) */
            body.forest-green { --accent-color: #2d6a4f; --accent-color-dark: #1b4332; --text-color-headings: #1b4332; background-color: #f0fff4; color: #1e4620; }
            .forest-green .container { background-color: #ffffff; }
            .forest-green .day-header { border-bottom: 2px solid var(--accent-color); }
            .forest-green h1, .forest-green .day-header h2 { color: var(--text-color-headings); }
            .forest-green .meal-block { background: #f6fff8; border: 1px solid #b7e4c7; }
            .forest-green .meal-block h3 { color: var(--accent-color); border-bottom: 1px solid #d8f3dc; }
            .forest-green .signature-footer { background-color: #f6fff8; border-top-color: #b7e4c7; }
            .forest-green .captain-name { color: var(--accent-color-dark); }

            /* 4. اللمسة الملكية (ذهبي) */
            body.royal-gold { --accent-color: #c5a773; --accent-color-dark: #8a6d3b; --text-color-headings: #8a6d3b; background-color: #fffaf0; color: #5d4037; }
            .royal-gold .container { background-color: #ffffff; }
            .royal-gold .day-header { border-bottom: 2px solid var(--accent-color); }
            .royal-gold h1, .royal-gold .day-header h2 { color: var(--text-color-headings); }
            .royal-gold .meal-block { background: #fffdf9; border: 1px solid #e0d2b4; }
            .royal-gold .meal-block h3 { color: var(--accent-color-dark); border-bottom: 1px solid #f5efe2; }
            .royal-gold .signature-footer { background-color: #fffdf9; border-top-color: #e0d2b4; }
            .royal-gold .captain-name { color: var(--accent-color-dark); text-shadow: 0 0 5px rgba(212, 175, 55, 0.3); }

            /* 5. الاحترافي (رمادي) */
            body.professional-gray { --accent-color: #495057; --accent-color-dark: #343a40; --text-color-headings: #343a40; background-color: #f8f9fa; color: #212529; }
            .professional-gray .container { background-color: #ffffff; }
            .professional-gray .day-header { border-bottom: 2px solid var(--accent-color); }
            .professional-gray h1, .professional-gray .day-header h2 { color: var(--text-color-headings); }
            .professional-gray .meal-block { background: #f8f9fa; border: 1px solid #dee2e6; }
            .professional-gray .meal-block h3 { color: var(--accent-color); border-bottom: 1px solid #e9ecef; }
            .professional-gray .signature-footer { background-color: #f8f9fa; border-top-color: #dee2e6; }
            .professional-gray .captain-name { color: var(--accent-color-dark); }

            /* 6. غروب الشمس (برتقالي) */
            body.sunset-orange { --accent-color: #f28c18; --accent-color-dark: #d97706; --text-color-headings: #c2410c; background-color: #fff7ed; color: #7c2d12; }
            .sunset-orange .container { background-color: #ffffff; }
            .sunset-orange .day-header { border-bottom: 2px solid var(--accent-color); }
            .sunset-orange h1, .sunset-orange .day-header h2 { color: var(--text-color-headings); }
            .sunset-orange .meal-block { background: #fffbeb; border: 1px solid #fed7aa; }
            .sunset-orange .meal-block h3 { color: var(--accent-color-dark); border-bottom: 1px solid #ffedd5; }
            .sunset-orange .signature-footer { background-color: #fffbeb; border-top-color: #fed7aa; }
            .sunset-orange .captain-name { color: var(--accent-color-dark); }

            /* 7. ملكي (بنفسجي) */
            body.royal-purple { --accent-color: #8b5cf6; --accent-color-dark: #7c3aed; --text-color-headings: #6d28d9; background-color: #f5f3ff; color: #5b21b6; }
            .royal-purple .container { background-color: #ffffff; }
            .royal-purple .day-header { border-bottom: 2px solid var(--accent-color); }
            .royal-purple h1, .royal-purple .day-header h2 { color: var(--text-color-headings); }
            .royal-purple .meal-block { background: #faf5ff; border: 1px solid #ddd6fe; }
            .royal-purple .meal-block h3 { color: var(--accent-color-dark); border-bottom: 1px solid #ede9fe; }
            .royal-purple .signature-footer { background-color: #faf5ff; border-top-color: #ddd6fe; }
            .royal-purple .captain-name { color: var(--accent-color-dark); }

            /* --- ✍️ تصميم توقيع الكابتن ✍️ --- */
            .signature-footer { margin-top: 50px; padding: 40px 20px; border-top: 2px solid #e0e0e0; text-align: center; font-family: 'Tajawal', sans-serif; background-color: #fff; }
            .signature-content .prepared-by { font-size: 1.1em; color: #888; margin: 0; }
            .signature-content .captain-name { font-size: 2.8em; font-weight: 700; margin: 5px 0; letter-spacing: 1px; color: #3498db; /* اللون الافتراضي */ }
            .signature-content .captain-title { font-size: 1.3em; color: #555; margin: 0 0 25px 0; }
            .signature-images { display: flex; justify-content: center; gap: 20px; margin-bottom: 25px; }
            .signature-images img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #ddd; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: transform 0.3s, box-shadow 0.3s; }
            .signature-images img:hover { transform: scale(1.05); box-shadow: 0 6px 15px rgba(0,0,0,0.15); }
            .whatsapp-button { display: inline-flex; align-items: center; gap: 10px; background-color: #25D366; color: white; padding: 12px 25px; border-radius: 50px; text-decoration: none; font-size: 1.2em; font-weight: bold; transition: transform 0.2s, background-color 0.2s; }
            .whatsapp-button:hover { background-color: #1DAE54; transform: scale(1.05); }

            /* --- تصميم التوقيع الكلاسيكي --- */
            .classic-signature { margin-top: 40px; padding: 30px; background: linear-gradient(145deg, #2c3e50, #1f2937); color: #f9fafb; border-radius: 12px; text-align: center; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
            .classic-signature .personal-details h2 { font-size: 2.8em; margin: 0 0 10px; color: #ffffff; font-weight: 700; }
            .classic-signature .personal-details h3 { font-size: 1.6em; margin: 0 0 25px; color: #5294e2; font-weight: 400; }
            .classic-signature .image-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 35px; }
            .classic-signature .gallery-item img { width: 100%; height: auto; border-radius: 8px; border: 4px solid #3b82f6; transition: transform 0.3s ease, box-shadow 0.3s ease; display: block; }
            .classic-signature .gallery-item img:hover { transform: scale(1.05); box-shadow: 0 0 15px rgba(59, 130, 246, 0.7); }
            .classic-signature .share-section { margin-top: 40px; text-align: center; padding: 25px; background: rgba(0,0,0,0.1); border-radius: 8px; }
            .classic-signature .share-section p { font-size: 1.1em; color: #d1d5db; margin: 0 0 15px; }

            /* --- تصميم التوقيع الحديث --- */
            .modern-signature { margin-top: 50px; padding: 0; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.08); display: flex; flex-wrap: wrap; background-color: #fff; }
            .modern-signature .modern-images { display: flex; width: 100%; }
            .modern-signature .modern-images img { width: calc(100% / 3); height: 200px; object-fit: cover; }
            .modern-signature .modern-content { padding: 30px; text-align: center; width: 100%; }
            .modern-signature .captain-name { font-size: 2.5em; font-weight: 700; margin: 0 0 5px 0; }
            .modern-signature .captain-title { font-size: 1.2em; color: #777; margin-bottom: 25px; }

            /* --- 🌙 الوضع الليلي 🌙 --- */
            body.dark-theme { background-color: #121212; color: #e0e0e0; }
            .dark-theme .container { background-color: #1e1e1e; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); }
            .dark-theme h1, .dark-theme .day-header h2 { color: #ffffff; text-shadow: 0 0 8px var(--accent-color); }
            .dark-theme p.description { color: #a0a0a0; }
            .dark-theme .day-block { background: #2a2a2a; border: 1px solid #444; }
            .dark-theme .day-header { border-bottom-color: var(--accent-color); }
            .dark-theme .meal-block { background: #333; border: 1px solid #555; }
            .dark-theme .meal-block h3 { color: #e0e0e0; border-bottom: 1px solid #555; }
            /* توقيع احترافي */
            .dark-theme .signature-footer { border-top-color: #444; background-color: #1e1e1e; }
            .dark-theme .captain-name { color: var(--accent-color); text-shadow: 0 0 10px var(--accent-color); }
            .dark-theme .captain-title, .dark-theme .prepared-by { color: #bbb; }
            /* توقيع كلاسيكي */
            .dark-theme .classic-signature { background: linear-gradient(145deg, #2a2a2a, #1a1a1a); }
            .dark-theme .classic-signature .personal-details h3 { color: var(--accent-color); }
            .dark-theme .classic-signature .gallery-item img { border-color: var(--accent-color); }
            /* توقيع حديث */
            .dark-theme .banner-header { background-blend-mode: overlay; background-color: rgba(0,0,0,0.3); }
            .dark-theme .modern-signature { background-color: #1e1e1e; border-color: #444; }
            .dark-theme .modern-signature .captain-name { color: #fff; text-shadow: 0 0 8px var(--accent-color); }
            .dark-theme .modern-signature .captain-title { color: #bbb; }

            /* 8. التصميم العصري (ذهبي وأسود) */
            body.modern-dark { --primary: #1a1a1a; --secondary: #2d2d2d; --accent: #d4af37; --accent-light: #e8d4a8; --text-primary: #f5f5f5; --text-secondary: #b0b0b0; --border: #404040; background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); color: var(--text-primary); font-family: 'Poppins', 'Tajawal', sans-serif; }
            .modern-dark .container { background-color: var(--secondary); border: 2px solid var(--accent); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .modern-dark .day-block { background: var(--secondary); border: 1px solid var(--border); border-left: 5px solid var(--accent); border-radius: 15px; }
            .modern-dark .day-header { border-bottom: 2px solid var(--border); }
            .modern-dark .day-header h2 { color: var(--text-primary); }
            .modern-dark .day-header h2 span { color: var(--accent); }
            .modern-dark .meal-block { background: linear-gradient(135deg, rgba(45, 45, 45, 0.8) 0%, rgba(30, 30, 30, 0.8) 100%); border: 1.5px solid var(--border); backdrop-filter: blur(10px); border-radius: 12px; }
            .modern-dark .meal-block h3 { color: var(--accent); border-bottom: 2px solid var(--border); }
            .modern-dark .meal-block [contenteditable="true"] { background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.2); }
            .modern-dark .meal-details span { background: rgba(212, 175, 55, 0.05); border-left: 3px solid var(--accent); color: var(--text-secondary); margin-top: 5px; padding: 8px 12px; border-radius: 6px; }
            .modern-dark .meal-details strong { color: var(--accent); }
            .modern-dark .banner-header { border: 2px solid var(--accent); box-shadow: 0 20px 60px rgba(212, 175, 55, 0.15); border-radius: 20px; }
            .modern-dark .banner-header h1 { color: var(--accent); text-shadow: 0 4px 20px rgba(0, 0, 0, 0.7); }
            .modern-dark .captain-name { color: var(--accent); text-shadow: 0 4px 15px rgba(212, 175, 55, 0.3); }
            .modern-dark .add-meal-btn { background: rgba(212, 175, 55, 0.2) !important; color: var(--accent) !important; border: 1px solid var(--accent) !important; }

            /* --- 📱 تصميم متجاوب مع الموبايل 📱 --- */
            @media (max-width: 768px) { 
                body { padding: 10px; }
                .container { padding: 15px; }
                .banner-header { padding: 40px 15px; }
                h1, .banner-header h1 { font-size: 2em; }
                .day-header h2 { font-size: 1.5em; }
                .meal-block h3 { font-size: 1.1em; }
                .signature-images img { width: 80px; height: 80px; }
                .signature-content .captain-name { font-size: 2em; }
                .classic-signature .image-gallery { grid-template-columns: 1fr; }
                .modern-signature .modern-images { flex-direction: column; }
                .modern-signature .modern-images img { width: 100%; height: 150px; }

                /* --- Layout 1: Vertical List (Default) --- */
                .mobile-vertical .meals-container { 
                    grid-template-columns: 1fr; 
                }

                /* --- Layout 2: Compact Grid --- */
                .mobile-grid .meals-container { 
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                .mobile-grid .meal-block { padding: 10px; }
                .mobile-grid .meal-block h3 { font-size: 1em; }

                /* --- Layout 3: Simplified Cards --- */
                .mobile-cards .meals-container {
                    grid-template-columns: 1fr;
                    gap: 8px;
                }
                .mobile-cards .day-block { padding: 15px; }
                .mobile-cards .meal-block {
                    box-shadow: none;
                    border-radius: 4px;
                    border-left: 4px solid var(--accent-color, #3498db);
                }
            }
        `;
    };

    /**
     * تجلب صورة من رابط وتحولها إلى سلسلة Base64.
     * @param {string} url - رابط الصورة على الإنترنت.
     * @returns {string} - سلسلة Base64 للصورة.
     */
    const imageUrlToBase64 = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`فشل تحميل الصورة: ${url}`);
            }
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error(error);
            alert(`حدث خطأ أثناء تحميل إحدى الصور. قد لا تظهر في الملف المحفوظ.\nالخطأ: ${error.message}`);
            return url; // في حالة الفشل، يتم الرجوع إلى الرابط الأصلي
        }
    };

    /**
     * يحفظ الخطة الحالية كملف HTML للقراءة فقط.
     */
    const savePlanAsHtml = () => {
        const fileName = prompt("الرجاء إدخال اسم للملف لحفظ الخطة:", "خطة غذائية");
        if (!fileName || fileName.trim() === "") {
            alert("تم إلغاء الحفظ. لم يتم إدخال اسم للملف.");
            return;
        }

        // 1. احصل على السمة المختارة من القائمة المنسدلة
        const selectedTheme = document.getElementById('theme-selector').value;
        const themeName = document.getElementById('theme-selector').options[document.getElementById('theme-selector').selectedIndex].text;
        const planType = planTypeSelector.value;
        const isDarkMode = modeToggleButton.dataset.mode === 'dark';
        const signatureLayout = document.getElementById('signature-layout-selector').value;
        const mobileLayout = document.getElementById('mobile-layout-selector').value;

        // 2. استنساخ حاوية الأيام فقط وتنظيفها
        const daysContainerClone = daysContainer.cloneNode(true);
        daysContainerClone.querySelectorAll('.delete-day-btn, .add-meal-btn, .delete-meal-btn').forEach(btn => btn.remove());
        
        daysContainerClone.querySelectorAll('[contenteditable="true"]').forEach(el => {
            el.removeAttribute('contenteditable');
        });
        daysContainerClone.querySelectorAll('.day-block').forEach(dayBlock => {
            dayBlock.classList.add('collapsed'); // إضافة حالة الطي الافتراضية
        });
        let dietPlanHtml = daysContainerClone.innerHTML;

        // 3. جلب الصور من الروابط وتحويلها إلى Base64
        const img1 = 'https://i.postimg.cc/mZcbZ6CW/541206584-18110849590533672-4486967375139027511-n.jpg'; // صورة البانر (الغلاف)
        const img2 = 'https://i.postimg.cc/9X4WXNTs/541582284-18110849581533672-3209587570225973115-n.jpg'; // صورة الكابتن 1
        const img3 = 'https://i.postimg.cc/gcwYcB8p/542465511-18110849599533672-9121194465655432988-n.jpg'; // صورة الكابتن 2

        // 4. إنشاء قسم التوقيع بناءً على الاختيار
        let signatureHtml = '';
        const whatsappButton = `<a href="#" id="whatsapp-share-btn" class="whatsapp-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20"><path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-65.7-10.8-94.2-30.6l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.8-16.2-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg><span>تواصل عبر واتساب</span></a>`;

        if (signatureLayout === 'professional') {
            signatureHtml = `<footer class="signature-footer"><div class="signature-images"><img src="${img2}" alt="صورة للكابتن Botta 2"><img src="${img3}" alt="صورة للكابتن Botta 3"></div><div class="signature-content"><p class="prepared-by">تم إعداد هذا البرنامج بواسطة</p><h3 class="captain-name">Botta</h3><p class="captain-title">خبير التغذية واللياقة البدنية Botta</p>${whatsappButton}</div></footer>`;
        } else if (signatureLayout === 'classic') {
            signatureHtml = `<div class="classic-signature"><div class="personal-details"><h2>Botta</h2><h3>خبير التغذية واللياقة البدنية Botta</h3></div><div class="image-gallery" style="grid-template-columns: repeat(2, 1fr);"><div class="gallery-item"><img src="${img2}" alt="صورة 2"></div><div class="gallery-item"><img src="${img3}" alt="صورة 3"></div></div><div class="share-section"><p>للاستفسار أو تعديل الخطة، تواصل معي مباشرة!</p>${whatsappButton}</div></div>`;
        } else if (signatureLayout === 'modern') {
            signatureHtml = `<footer class="modern-signature"><div class="modern-images" style="--img-count: 2;"><img src="${img2}" alt="صورة للكابتن Botta 2"><img src="${img3}" alt="صورة للكابتن Botta 3"></div><div class="modern-content"><h3 class="captain-name">Botta</h3><p class="captain-title">خبير التغذية واللياقة البدنية Botta</p>${whatsappButton}</div></footer>`;
        }

        // 5. إضافة كود الحفظ التلقائي وتفعيل التعديل فقط لخطة التدريب
        let autoSaveScript = '';
        if (planType === 'workout') {
            // تفعيل التعديل لحقول الوزن والعدادات فقط (وليس المجاميع)
            daysContainerClone.querySelectorAll('.meal-details .workout-field').forEach((fieldSpan, index) => {
                const label = fieldSpan.querySelector('strong')?.textContent || '';
                if (label.includes('الوزن') || label.includes('العدادات')) {
                    const editableSpan = fieldSpan.querySelector('span');
                    if (!editableSpan) return;
                    editableSpan.setAttribute('contenteditable', 'true');
                    editableSpan.setAttribute('data-id', `field-${index}`); // معرف ثابت يعتمد على الترتيب
                }
            });
            dietPlanHtml = daysContainerClone.innerHTML; // <<-- الإصلاح: إعادة تعيين المحتوى بعد التعديل

            autoSaveScript = `
                <script>
                    const planId = 'workout-plan-storage'; // معرف فريد لهذه الخطة
                    const editableFields = document.querySelectorAll('[data-id]');
                    
                    // تحميل البيانات عند فتح الصفحة
                    editableFields.forEach(field => {
                        const savedValue = localStorage.getItem(planId + '-' + field.dataset.id);
                        if (savedValue) field.textContent = savedValue;
                    });

                    // حفظ البيانات عند التعديل
                    document.getElementById('days-container').addEventListener('input', (e) => {
                        if (e.target.hasAttribute('data-id')) {
                            localStorage.setItem(planId + '-' + e.target.dataset.id, e.target.textContent);
                        }
                    });
                <\/script>
            `;
        }

        // 5.5 إنشاء رأس الصفحة (البانر)
        const bannerHeaderHtml = `
            <div class="banner-header" style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.8)), url('${img1}');">
                <h1>${planType === 'diet' ? 'جدول النظام الغذائي' : 'جدول النظام التدريبي'}</h1>
                <p class="description">خطة "${fileName}"</p>
            </div>
        `;

        // 6. تجميع كود HTML الكامل للصفحة الجديدة
        const fullHtml = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${fileName.trim()}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Tajawal:wght@400;700&family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
                <style>
                    ${getThemeStyles()}
                </style>
            </head>
            <body class="${selectedTheme} ${isDarkMode ? 'dark-theme' : ''} ${mobileLayout}">
                <div class="container">
                    ${bannerHeaderHtml}
                    <div id="days-container">${dietPlanHtml}</div>
                    ${signatureHtml}
                </div>
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        // كود تفعيل خاصية الطي والفتح
                        document.getElementById('days-container').addEventListener('click', function(event) {
                            const dayHeader = event.target.closest('.day-header');
                            if (dayHeader && !event.target.closest('a')) {
                                const dayBlock = dayHeader.closest('.day-block');
                                if (dayBlock) {
                                    dayBlock.classList.toggle('collapsed');
                                }
                            }
                        });

                        // كود زر الواتساب
                        const whatsappBtn = document.getElementById('whatsapp-share-btn');
                        if (whatsappBtn) {
                            whatsappBtn.addEventListener('click', function(e) {
                                e.preventDefault();
                                const phoneNumber = "201099156738";
                                const message = "أهلاً كابتن محمد، لدي استفسار بخصوص الخطة.";
                                const encodedMessage = encodeURIComponent(message);
                                window.open('https://wa.me/' + phoneNumber + '?text=' + encodedMessage, '_blank');
                            });
                        }
                    });
                </script>
                ${autoSaveScript}
            </body>
            </html>
        `;

        // 7. تعمية (تشفير) المحتوى بالكامل لمنع التعديل السهل
        const encodedHtml = btoa(unescape(encodeURIComponent(fullHtml)));

        // 8. إنشاء ملف HTML الحاضن الذي سيقوم بفك التشفير
        const obfuscatedHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${fileName.trim()}</title>
                <meta charset="UTF-8">
                <style>body{font-family: sans-serif; text-align: center; padding-top: 50px; background-color: #f0f0f0;}</style>
            </head>
            <body>
                <script>
                    try {
                        document.write(decodeURIComponent(escape(atob('${encodedHtml}'))));
                    } catch (e) {
                        document.body.innerHTML = '<h1>حدث خطأ أثناء عرض محتوى الصفحة.</h1>';
                    }
                <\/script>
                <noscript>
                    <h1>يرجى تفعيل الجافاسكريبت لعرض هذه الصفحة.</h1>
                </noscript>
            </body>
            </html>
        `;

        // 9. إنشاء وتنزيل الملف المعمى (المشفر)
        const blob = new Blob([obfuscatedHtml], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName.trim()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        alert(`تم تجهيز الملف "${fileName.trim()}.html" للتنزيل.`);
    };

    /**
     * يقرأ ملف خطة HTML المحفوظ ويعيد تحميله في المحرر.
     * @param {Event} event - حدث تغيير حقل إدخال الملف.
     */
    const loadPlanFromFile = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const fileContent = e.target.result;

                // 1. استخراج المحتوى المشفر وفك تشفيره
                const base64Match = fileContent.match(/atob\('([^']+)'\)/);
                if (!base64Match || !base64Match[1]) {
                    throw new Error("الملف غير صالح أو لا يحتوي على محتوى مشفر.");
                }
                const decodedHtml = decodeURIComponent(escape(atob(base64Match[1])));

                // 2. إنشاء عنصر DOM مؤقت لتحليل المحتوى
                const parser = new DOMParser();
                const doc = parser.parseFromString(decodedHtml, 'text/html');

                // 3. استخراج الإعدادات من الملف المحمل
                const bodyClasses = doc.body.className.split(' ');
                const theme = bodyClasses.find(c => c.endsWith('-light') || ['ocean-blue', 'forest-green', 'royal-gold', 'professional-gray', 'sunset-orange', 'royal-purple'].includes(c)) || 'default-light';
                const isDarkMode = bodyClasses.includes('dark-theme');
                const planType = doc.querySelector('.banner-header h1').textContent.includes('التدريبي') ? 'workout' : 'diet';
                const signatureElement = doc.querySelector('footer, .classic-signature');
                let signatureLayout = 'professional';
                const mobileLayout = bodyClasses.find(c => c.startsWith('mobile-')) || 'mobile-vertical';
                if (signatureElement) {
                    if (signatureElement.classList.contains('classic-signature')) signatureLayout = 'classic';
                    else if (signatureElement.classList.contains('modern-signature')) signatureLayout = 'modern';
                }

                // 4. استخراج محتوى الأيام وإعادة بنائه ليكون قابلاً للتعديل
                const loadedDaysContainer = doc.getElementById('days-container');
                if (!loadedDaysContainer) {
                    throw new Error("لم يتم العثور على حاوية الأيام في الملف.");
                }

                // إعادة تفعيل حقول التعديل وإضافة الأزرار المحذوفة
                loadedDaysContainer.querySelectorAll('.day-block').forEach(dayBlock => {
                    dayBlock.querySelector('.day-header h2').setAttribute('contenteditable', 'true');
                    const addBtnText = planType === 'diet' ? '➕ إضافة وجبة' : '➕ إضافة تمرين';
                    const dayHeaderButtons = dayBlock.querySelector('.day-header-buttons');
                    dayHeaderButtons.innerHTML = `
                        <button class="add-meal-btn">${addBtnText}</button>
                        <button class="delete-day-btn" title="حذف اليوم">🗑️</button>
                    `;

                    dayBlock.querySelectorAll('.meal-block').forEach(mealBlock => {
                        mealBlock.querySelector('h3').setAttribute('contenteditable', 'true');
                        mealBlock.querySelector('.meal-content').setAttribute('contenteditable', 'true');
                        mealBlock.querySelectorAll('.meal-details span[contenteditable]').forEach(span => span.setAttribute('contenteditable', 'true'));
                        
                        // إضافة زر حذف الوجبة
                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'delete-meal-btn';
                        deleteBtn.title = 'حذف الوجبة';
                        deleteBtn.innerHTML = '🗑️';
                        mealBlock.prepend(deleteBtn);
                    });
                });

                // 5. تحديث الصفحة بالمحتوى الجديد
                daysContainer.innerHTML = loadedDaysContainer.innerHTML;
                dayCounter = daysContainer.querySelectorAll('.day-block').length;

                // 6. تحديث عناصر التحكم في الواجهة الرئيسية
                planTypeSelector.value = planType;
                document.getElementById('theme-selector').value = theme;
                document.getElementById('signature-layout-selector').value = signatureLayout;
                document.getElementById('mobile-layout-selector').value = mobileLayout;
                
                if ((isDarkMode && modeToggleButton.dataset.mode !== 'dark') || (!isDarkMode && modeToggleButton.dataset.mode === 'dark')) {
                    toggleMode(); // تبديل الوضع إذا كان مختلفًا
                }
                
                updateUIForPlanType(); // تحديث الواجهة لتطابق نوع الخطة

                alert("تم استعادة الخطة بنجاح وجاهزة للتعديل.");

            } catch (error) {
                console.error("فشل في تحميل الخطة:", error);
                alert(`حدث خطأ أثناء محاولة استعادة الملف. قد يكون الملف غير صالح.\n${error.message}`);
            } finally {
                // إعادة تعيين حقل الإدخال للسماح بتحميل نفس الملف مرة أخرى
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    // --- التهيئة الأولية للصفحة ---
    if (planTypeSelector) {
        populateNutritionFields(); // إنشاء صناديق اختيار الحقول الغذائية
        updateUIForPlanType(); // تحديث الواجهة بناءً على الاختيار الافتراضي
    }

    // ربط الأحداث بالأزرار الرئيسية
    if (addDayButton) {
        addDayButton.addEventListener('click', addDay);
    }
    if (deleteAllButton) {
        deleteAllButton.addEventListener('click', deleteAllDays);
    }
    if (saveButton) {
        saveButton.addEventListener('click', savePlanAsHtml);
    }
    if (loadPlanButton) {
        loadPlanButton.addEventListener('click', () => planFileInput.click()); // فتح نافذة اختيار الملف
    }
    if (planFileInput) {
        planFileInput.addEventListener('change', loadPlanFromFile);
    }
    if (modeToggleButton) {
        modeToggleButton.addEventListener('click', toggleMode);
    }
    if (planTypeSelector) {
        planTypeSelector.addEventListener('change', updateUIForPlanType);
    }

    /**
     * استخدام تفويض الأحداث للتعامل مع الأزرار الديناميكية (إضافة وجبة، حذف وجبة، حذف يوم).
     */
    if (daysContainer) {
        daysContainer.addEventListener('click', (event) => {
            const target = event.target;

            // الحالة 1: الضغط على زر "إضافة وجبة"
            if (target.classList.contains('add-meal-btn')) {
                // ابحث عن حاوية الوجبات الأقرب لهذا الزر
                const mealsContainer = target.closest('.day-block').querySelector('.meals-container');
                if (mealsContainer) {
                    mealsContainer.appendChild(createMealBlock());
                }
            }

            // الحالة 2: الضغط على زر "حذف اليوم"
            if (target.classList.contains('delete-day-btn')) {
                const dayBlock = target.closest('.day-block');
                if (dayBlock && confirm('هل أنت متأكد من حذف هذا اليوم بالكامل؟')) {
                    dayBlock.remove();
                    // ملاحظة: لا نعيد ترتيب أرقام الأيام الأخرى للحفاظ على البساطة
                }
            }

            // الحالة 3: الضغط على زر "حذف الوجبة"
            // يجب التأكد من أننا نضغط على الزر نفسه أو الأيقونة بداخله
            const deleteMealButton = target.closest('.delete-meal-btn');
            if (deleteMealButton) {
                const mealBlock = deleteMealButton.closest('.meal-block');
                if (mealBlock) {
                    // لا نطلب تأكيدًا لحذف وجبة واحدة لسرعة الاستخدام
                    mealBlock.remove();
                }
            }
        });
    }

    // --- منطق تطبيق الـ PWA (خاص بصفحة app.html) ---
    const pwaAddBtn = document.getElementById('add-plan-pwa-btn');
    const pwaInput = document.getElementById('pwa-file-input');
    const pwaContentArea = document.getElementById('pwa-content-area');
    const initialSetup = document.getElementById('initial-setup');

    // --- زر دخول الإدارة من داخل التطبيق ---
    const adminBtn = document.getElementById('admin-login-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            const pass = prompt('الرجاء إدخال كلمة المرور لدخول لوحة الإدارة:');
            if (pass === '12345') {
                window.location.href = 'index.html?user=12345';
            } else if (pass !== null) {
                alert('كلمة مرور خاطئة!');
            }
        });
    }


    if (pwaAddBtn) {
        // وظيفة فك تشفير وعرض الخطة
        const renderSavedPlan = (fileContent) => {
            try {
                const base64Match = fileContent.match(/atob\('([^']+)'\)/);
                if (!base64Match) return false;

                const decodedHtml = decodeURIComponent(escape(atob(base64Match[1])));
                const parser = new DOMParser();
                const doc = parser.parseFromString(decodedHtml, 'text/html');
                
                // استخراج المحتوى والأنماط
                const container = doc.querySelector('.container');
                const styles = doc.querySelector('style');

                if (container && styles) {
                    // 1. نقل التنسيقات والسمات (الألوان، الوضع الليلي، شكل الموبايل)
                    document.body.className = doc.body.className;
                    document.head.appendChild(styles.cloneNode(true));
                    pwaContentArea.innerHTML = container.outerHTML;
                    
                    // 2. استعادة الأوزان والعدات المحفوظة
                    pwaContentArea.querySelectorAll('[data-id]').forEach(field => {
                        const savedValue = localStorage.getItem('pwa-val-' + field.dataset.id);
                        if (savedValue) field.textContent = savedValue;
                    });

                    // 3. تفعيل الحفظ التلقائي عند الكتابة
                    pwaContentArea.addEventListener('input', (e) => {
                        if (e.target.hasAttribute('data-id')) {
                            localStorage.setItem('pwa-val-' + e.target.dataset.id, e.target.textContent);
                        }
                    }, { passive: true });

                    // إضافة زر إعادة التعيين في الأسفل
                    const resetBtn = document.createElement('button');
                    resetBtn.id = 'reset-plan-btn';
                    resetBtn.textContent = '🔄 تغيير الخطة الحالية';
                    pwaContentArea.appendChild(resetBtn);

                    initialSetup.style.display = 'none';
                    pwaContentArea.style.display = 'block';
                    
                    // تفعيل ميزة الطي والفتح داخل التطبيق
                    pwaContentArea.addEventListener('click', (e) => {
                        const header = e.target.closest('.day-header');
                        if (header) header.closest('.day-block').classList.toggle('collapsed');
                        
                        if (e.target.id === 'reset-plan-btn') {
                            if (confirm('هل تريد حذف الخطة الحالية واختيار ملف آخر؟')) {
                                // مسح البيانات المحفوظة للأوزان عند تغيير الخطة (اختياري)
                                Object.keys(localStorage).forEach(key => {
                                    if (key.startsWith('pwa-val-')) localStorage.removeItem(key);
                                });
                                localStorage.removeItem('km_saved_pwa_file');
                                location.reload();
                            }
                        }
                    });
                    return true;
                }
            } catch (err) {
                console.error("خطأ في معالجة الملف:", err);
            }
            return false;
        };

        // 1. التحقق من وجود خطة محفوظة مسبقاً
        const savedFile = localStorage.getItem('km_saved_pwa_file');
        if (savedFile) {
            renderSavedPlan(savedFile);
        }

        // 2. زر إضافة خطة جديدة
        pwaAddBtn.addEventListener('click', () => pwaInput.click());

        pwaInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target.result;
                    if (renderSavedPlan(content)) {
                        localStorage.setItem('km_saved_pwa_file', content);
                        alert('تم حفظ الخطة في التطبيق بنجاح!');
                    } else {
                        alert('الملف غير صحيح. يرجى اختيار ملف HTML ناتج عن المحرر.');
                    }
                };
                reader.readAsText(file);
            }
        });

        // تفعيل أزرار الواتساب داخل التطبيق إذا وجدت
        pwaContentArea.addEventListener('click', (e) => {
            if (e.target.closest('.whatsapp-button')) {
                window.open('https://wa.me/201099156738?text=' + encodeURIComponent('أهلاً كابتن، لدي استفسار بخصوص الخطة.'), '_blank');
            }
        });
    }
});
