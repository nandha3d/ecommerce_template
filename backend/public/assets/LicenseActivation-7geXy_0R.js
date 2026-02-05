import{r as i,f as t,j as e}from"./index-Cy8_FwMa.js";const L=()=>{const[c,p]=i.useState(""),[s,g]=i.useState(null),[b,h]=i.useState([]),[v,x]=i.useState(!0),[l,u]=i.useState(!1),[m,n]=i.useState(""),[f,o]=i.useState("");i.useEffect(()=>{d()},[]);const d=async()=>{try{x(!0);const[a,r]=await Promise.all([t.get("/license/status"),t.get("/license/modules").catch(()=>({data:{data:[]}}))]);g(a.data.data),h(r.data.data||[])}catch(a){console.error("Failed to fetch license status",a)}finally{x(!1)}},j=async a=>{a.preventDefault(),n(""),o(""),u(!0);try{const r=await t.post("/license/activate",{license_key:c});r.data.success?(o("License activated successfully!"),p(""),d()):n(r.data.message||"Activation failed")}catch(r){n(r.response?.data?.message||"Failed to activate license")}finally{u(!1)}},N=async()=>{try{(await t.post("/license/revalidate")).data.success&&(o("License revalidated successfully"),d())}catch{n("Failed to revalidate license")}},y=a=>{switch(a){case"enterprise":return"#7c3aed";case"professional":return"#2563eb";case"starter":return"#059669";default:return"#6b7280"}},k=a=>{switch(a){case"active":return"#10b981";case"expired":return"#f59e0b";case"revoked":return"#ef4444";default:return"#6b7280"}};return v?e.jsx("div",{className:"license-page",children:e.jsx("div",{className:"loading-spinner",children:"Loading..."})}):e.jsxs("div",{className:"license-page",children:[e.jsxs("div",{className:"license-header",children:[e.jsx("h1",{children:"🔐 License Management"}),e.jsx("p",{children:"Manage your SupplePro license and unlock premium features"})]}),s?.activated?e.jsxs("div",{className:"license-card active",children:[e.jsxs("div",{className:"license-status-header",children:[e.jsx("div",{className:"status-badge",style:{backgroundColor:k(s.status||"active")},children:s.status?.toUpperCase()||"ACTIVE"}),e.jsx("div",{className:"tier-badge",style:{backgroundColor:y(s.tier||"")},children:s.tier_display||s.tier})]}),e.jsxs("div",{className:"license-info",children:[e.jsxs("div",{className:"info-item",children:[e.jsx("span",{className:"label",children:"Expires"}),e.jsx("span",{className:"value",children:s.expires_at||"Never (Lifetime)"})]}),e.jsxs("div",{className:"info-item",children:[e.jsx("span",{className:"label",children:"Support Until"}),e.jsx("span",{className:"value",children:s.support_until||"N/A"})]}),e.jsxs("div",{className:"info-item",children:[e.jsx("span",{className:"label",children:"Last Validated"}),e.jsx("span",{className:"value",children:s.last_validated||"Never"})]})]}),e.jsxs("div",{className:"license-actions",children:[e.jsx("button",{onClick:N,className:"btn-secondary",children:"🔄 Revalidate"}),e.jsx("a",{href:"https://supplepro.com/pricing",target:"_blank",rel:"noopener noreferrer",className:"btn-upgrade",children:"⬆️ Upgrade License"})]})]}):e.jsx("div",{className:"license-card inactive",children:e.jsxs("div",{className:"no-license",children:[e.jsx("span",{className:"icon",children:"🔒"}),e.jsx("h3",{children:"No Active License"}),e.jsx("p",{children:"Enter your license key below to activate premium features"})]})}),e.jsxs("div",{className:"activation-section",children:[e.jsx("h2",{children:"Activate License"}),m&&e.jsx("div",{className:"alert error",children:m}),f&&e.jsx("div",{className:"alert success",children:f}),e.jsxs("form",{onSubmit:j,className:"activation-form",children:[e.jsx("input",{type:"text",value:c,onChange:a=>p(a.target.value),placeholder:"SPLE-XXXX-XXXX-XXXX.xxxxx...",className:"license-input",disabled:l}),e.jsx("button",{type:"submit",className:"btn-primary",disabled:l||!c,children:l?"Activating...":"Activate License"})]}),e.jsxs("p",{className:"help-text",children:["Don't have a license? ",e.jsx("a",{href:"https://supplepro.com/pricing",target:"_blank",rel:"noopener noreferrer",children:"Purchase one here"})]})]}),e.jsxs("div",{className:"modules-section",children:[e.jsx("h2",{children:"Available Modules"}),e.jsx("div",{className:"modules-grid",children:b.map(a=>e.jsxs("div",{className:`module-card ${a.is_licensed?"licensed":"locked"} ${a.is_active?"active":""}`,children:[e.jsx("div",{className:"module-icon",children:a.is_licensed?"✅":"🔒"}),e.jsxs("div",{className:"module-info",children:[e.jsx("h4",{children:a.name}),e.jsx("p",{children:a.description})]}),e.jsx("div",{className:"module-status",children:a.is_core?e.jsx("span",{className:"badge core",children:"Core"}):a.is_licensed?e.jsx("span",{className:"badge licensed",children:"Licensed"}):e.jsx("span",{className:"badge locked",children:"Upgrade Required"})})]},a.id))})]}),e.jsx("style",{children:`
                .license-page {
                    padding: 32px;
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .license-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .license-header h1 {
                    font-size: 28px;
                    margin: 0 0 8px;
                    color: #1f2937;
                }

                .license-header p {
                    color: #6b7280;
                    margin: 0;
                }

                .license-card {
                    background: #fff;
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }

                .license-card.active {
                    border: 2px solid #10b981;
                }

                .license-card.inactive {
                    border: 2px dashed #d1d5db;
                }

                .license-status-header {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .status-badge, .tier-badge {
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #fff;
                    text-transform: uppercase;
                }

                .license-info {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .info-item .label {
                    font-size: 12px;
                    color: #6b7280;
                    text-transform: uppercase;
                }

                .info-item .value {
                    font-weight: 600;
                    color: #1f2937;
                }

                .license-actions {
                    display: flex;
                    gap: 12px;
                }

                .no-license {
                    text-align: center;
                    padding: 40px 20px;
                }

                .no-license .icon {
                    font-size: 48px;
                    display: block;
                    margin-bottom: 16px;
                }

                .no-license h3 {
                    margin: 0 0 8px;
                    color: #374151;
                }

                .no-license p {
                    margin: 0;
                    color: #6b7280;
                }

                .activation-section {
                    background: #fff;
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }

                .activation-section h2 {
                    margin: 0 0 16px;
                    font-size: 20px;
                }

                .activation-form {
                    display: flex;
                    gap: 12px;
                }

                .license-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    font-family: monospace;
                }

                .license-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: #fff;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s;
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                }

                .btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .btn-upgrade {
                    background: linear-gradient(135deg, #7c3aed, #5b21b6);
                    color: #fff;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 500;
                }

                .help-text {
                    margin-top: 12px;
                    font-size: 14px;
                    color: #6b7280;
                }

                .help-text a {
                    color: #3b82f6;
                }

                .alert {
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                }

                .alert.error {
                    background: #fef2f2;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                }

                .alert.success {
                    background: #f0fdf4;
                    color: #16a34a;
                    border: 1px solid #bbf7d0;
                }

                .modules-section {
                    background: #fff;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }

                .modules-section h2 {
                    margin: 0 0 20px;
                    font-size: 20px;
                }

                .modules-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 16px;
                }

                .module-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    border-radius: 12px;
                    border: 2px solid #e5e7eb;
                    transition: all 0.2s;
                }

                .module-card.licensed {
                    border-color: #10b981;
                    background: #f0fdf4;
                }

                .module-card.locked {
                    opacity: 0.7;
                }

                .module-icon {
                    font-size: 24px;
                }

                .module-info {
                    flex: 1;
                }

                .module-info h4 {
                    margin: 0 0 4px;
                    font-size: 14px;
                }

                .module-info p {
                    margin: 0;
                    font-size: 12px;
                    color: #6b7280;
                }

                .badge {
                    font-size: 10px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .badge.core {
                    background: #dbeafe;
                    color: #1d4ed8;
                }

                .badge.licensed {
                    background: #d1fae5;
                    color: #059669;
                }

                .badge.locked {
                    background: #fef3c7;
                    color: #d97706;
                }

                .loading-spinner {
                    text-align: center;
                    padding: 60px;
                    color: #6b7280;
                }

                @media (max-width: 640px) {
                    .license-info {
                        grid-template-columns: 1fr;
                    }

                    .activation-form {
                        flex-direction: column;
                    }

                    .license-actions {
                        flex-direction: column;
                    }
                }
            `})]})};export{L as default};
