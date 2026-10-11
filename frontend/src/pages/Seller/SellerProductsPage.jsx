import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../../services/categoriesService";
import { getProducts, createProduct, deleteProduct, updateProductStatus } from "../../services/productService";
import { uploadProductImages } from "../../services/productService";
import { createVariant } from "../../services/variantService";
import { uploadImage } from "../../services/imageUploadService";
import { getImageUrl } from "../../services/imageUploadService";
import EnhancedVariantManager from "../../components/EnhancedVariantManager";
import { getAttributesForCategory } from "../../config/categoryAttributes";

// ─── Google Font ──────────────────────────────────────────────────────────────
const FONT = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{margin:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#e8e7e2;border-radius:3px}@keyframes spin{to{transform:rotate(360deg)}}@keyframes drawerIn{from{transform:translateX(100%)}to{transform:none}}@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`;

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  primary:"#1d5bf5", primaryHov:"#1649d4", primaryLt:"rgba(29,91,245,0.08)",
  primaryBd:"rgba(29,91,245,0.2)", text:"#1a1916", sub:"#6b6b67",
  muted:"#a09f97", mutedLt:"#d4d3ce", bg:"#f5f4f0", surface:"#ffffff",
  border:"#e8e7e2", borderLt:"#f0efe9",
  danger:"#dc2626", dangerLt:"rgba(220,38,38,0.08)", dangerBd:"rgba(220,38,38,0.2)",
  success:"#16a34a", successLt:"rgba(22,163,74,0.08)",
  warning:"#d97706", warningLt:"rgba(217,119,6,0.08)",
  overlay:"rgba(26,25,22,0.5)",
};
const R = { sm:"6px", md:"10px", lg:"14px", xl:"18px", xxl:"24px", full:"999px" };
const SH = { sm:"0 1px 4px rgba(0,0,0,0.07)", md:"0 4px 16px rgba(0,0,0,0.08)", lg:"0 8px 32px rgba(0,0,0,0.1)", xl:"0 20px 60px rgba(0,0,0,0.14)" };
const FF = "'DM Sans', sans-serif";
const TR = "all 0.15s ease";

const STATUS_MAP = {
  active:       { bg:"#e8f5e9", text:"#1b5e20", dot:"#43a047", label:"Active" },
  inactive:     { bg:"#f3f4f6", text:"#4b5563", dot:"#9ca3af", label:"Inactive" },
  out_of_stock: { bg:"#fef2f2", text:"#991b1b", dot:"#ef4444", label:"Out of Stock" },
  draft:        { bg:"#fff8e1", text:"#92400e", dot:"#f59e0b", label:"Draft" },
};

// ─── Backend API Integration ──────────────────────────────────────────────────

// ─── Normalize product data from backend to UI format ─────────────────────────
const normalizeProduct = (product) => {
  // Build images array: use full images array if available, fallback to primaryImage
  let images = [];
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    images = product.images.filter(img => img && img.trim()).map((img) => getImageUrl(img)); // Filter out empty/whitespace strings
  } 
  if (images.length === 0 && product.primaryImageUrl && product.primaryImageUrl.trim()) {
    images = [getImageUrl(product.primaryImageUrl)];
  }
  
  return {
    id: product.id || "",
    name: product.name || "Unnamed Product",
    category: product.categoryName || "Other",
    price: product.price || 0,
    stock: product.stockQty || 0,
    status: product.isActive ? "active" : "inactive",
    description: product.description || "",
    images: images || [], // Return empty array if no images
    createdAt: product.createdAt || new Date().toISOString(),
    sales: 0,
  };
};

// ─── Backend API Wrapper ───────────────────────────────────────────────────────
const api = {
  list: async (filters = {}) => {
    try {
      const products = await getProducts();
      let filtered = (products || []).map(normalizeProduct);
      
      // Apply filters
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
      }
      if (filters.category && filters.category !== "all") {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      if (filters.stock === "low") filtered = filtered.filter(p => p.stock > 0 && p.stock <= 10);
      if (filters.stock === "out") filtered = filtered.filter(p => p.stock === 0);
      if (filters.stock === "ok") filtered = filtered.filter(p => p.stock > 10);
      
      // Apply sorting
      if (filters.sort === "price_asc") filtered.sort((a, b) => a.price - b.price);
      if (filters.sort === "price_desc") filtered.sort((a, b) => b.price - a.price);
      if (filters.sort === "oldest") filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      if (!filters.sort || filters.sort === "newest") filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return filtered;
    } catch (err) {
      console.error("Failed to list products:", err);
      return [];
    }
  },

  create: async (product) => {
    try {
      const created = await createProduct({
        categoryId: product.category,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stockQty: parseInt(product.stock),
      });
      return normalizeProduct(created);
    } catch (err) {
      console.error("Failed to create product:", err);
      throw new Error(err.response?.data?.message || "Failed to create product");
    }
  },

  update: async (productId, updates) => {
    try {
      const status = updates.status === "active" ? "active" : "inactive";
      await updateProductStatus(productId, status);
      
      const products = await getProducts();
      const updated = products.find(p => p.id === productId);
      return normalizeProduct(updated);
    } catch (err) {
      console.error("Failed to update product:", err);
      throw new Error(err.response?.data?.message || "Failed to update product");
    }
  },

  remove: async (productId) => {
    try {
      await deleteProduct(productId);
    } catch (err) {
      console.error("Failed to delete product:", err);
      throw new Error(err.response?.data?.message || "Failed to delete product");
    }
  },

  stock: async (productId, stockQty) => {
    try {
      const newStatus = parseInt(stockQty) === 0 ? "inactive" : "active";
      await updateProductStatus(productId, newStatus);
      
      const products = await getProducts();
      const updated = products.find(p => p.id === productId);
      return normalizeProduct(updated);
    } catch (err) {
      console.error("Failed to update stock:", err);
      throw new Error(err.response?.data?.message || "Failed to update stock");
    }
  },

  toggle: async (productId) => {
    try {
      const products = await getProducts();
      const product = products.find(p => p.id === productId);
      const newStatus = product.isActive ? "inactive" : "active";
      
      await updateProductStatus(productId, newStatus);
      
      const updated = products.find(p => p.id === productId);
      return normalizeProduct(updated);
    } catch (err) {
      console.error("Failed to toggle status:", err);
      throw new Error(err.response?.data?.message || "Failed to toggle status");
    }
  },
};

// ─── UI Primitives ────────────────────────────────────────────────────────────
function StatusBadge({status}){
  const s=STATUS_MAP[status]||STATUS_MAP.inactive;
  return(<span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:R.full,background:s.bg,color:s.text,fontSize:11,fontWeight:500,whiteSpace:"nowrap"}}><span style={{width:5,height:5,borderRadius:"50%",background:s.dot,flexShrink:0}}/>{s.label}</span>);
}

function Btn({label,onClick,variant="ghost",size="md",icon,disabled,fullWidth,type="button"}){
  const [h,setH]=useState(false);
  const sz={sm:{p:"5px 10px",fs:12},md:{p:"8px 14px",fs:13},lg:{p:"11px 20px",fs:14}}[size]||{p:"8px 14px",fs:13};
  const vr={
    primary:{bg:disabled?C.mutedLt:h?C.primaryHov:C.primary,color:"#fff",border:"1px solid transparent"},
    ghost:{bg:h?C.bg:"transparent",color:h?C.text:C.sub,border:`1px solid ${h?C.border:"transparent"}`},
    outline:{bg:h?C.bg:C.surface,color:C.text,border:`1px solid ${C.border}`},
    danger:{bg:h?C.dangerLt:"transparent",color:h?C.danger:C.muted,border:`1px solid ${h?C.dangerBd:"transparent"}`},
    dangerSolid:{bg:disabled?C.mutedLt:h?"#b91c1c":C.danger,color:"#fff",border:"1px solid transparent"},
  }[variant]||{};
  return(<button type={type} onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:sz.p,borderRadius:R.md,fontSize:sz.fs,fontWeight:500,fontFamily:FF,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.55:1,transition:TR,whiteSpace:"nowrap",width:fullWidth?"100%":undefined,...vr}}>{icon&&<span style={{fontSize:sz.fs,lineHeight:1}}>{icon}</span>}{label}</button>);
}

function Field({label,name,value,onChange,type="text",placeholder,required,error,prefix,rows,min,max,step,disabled}){
  const [foc,setFoc]=useState(false);
  const base={width:"100%",padding:prefix?"9px 12px 9px 34px":"9px 12px",borderRadius:R.md,fontFamily:FF,fontSize:13,outline:"none",transition:TR,boxSizing:"border-box",border:`1px solid ${error?C.danger:foc?C.primary:C.border}`,background:disabled?C.bg:C.surface,color:C.text};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontSize:12,fontWeight:500,color:C.sub}}>{label}{required&&<span style={{color:C.danger,marginLeft:2}}>*</span>}</label>}
      <div style={{position:"relative"}}>
        {prefix&&<span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:C.muted,pointerEvents:"none"}}>{prefix}</span>}
        {rows?<textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)} style={{...base,resize:"vertical",lineHeight:1.6}}/>
          :<input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} min={min} max={max} step={step} onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)} style={base}/>}
      </div>
      {error&&<span style={{fontSize:11,color:C.danger}}>{error}</span>}
    </div>
  );
}

function FSelect({label,name,value,onChange,options,required,error}){
  const [foc,setFoc]=useState(false);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontSize:12,fontWeight:500,color:C.sub}}>{label}{required&&<span style={{color:C.danger,marginLeft:2}}>*</span>}</label>}
      <div style={{position:"relative"}}>
        <select name={name} value={value} onChange={onChange} onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
          style={{width:"100%",padding:"9px 28px 9px 12px",borderRadius:R.md,fontFamily:FF,fontSize:13,border:`1px solid ${error?C.danger:foc?C.primary:C.border}`,background:C.surface,color:C.text,outline:"none",appearance:"none",cursor:"pointer",transition:TR,boxSizing:"border-box"}}>
          {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:9,color:C.muted}}>▼</span>
      </div>
      {error&&<span style={{fontSize:11,color:C.danger}}>{error}</span>}
    </div>
  );
}

function Spinner(){return(<div style={{display:"flex",justifyContent:"center",alignItems:"center",padding:"64px 24px"}}><div style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${C.border}`,borderTopColor:C.primary,animation:"spin 0.7s linear infinite"}}/></div>);}

function Toast({msg,type,onClose}){
  const m={success:{bg:C.successLt,color:C.success,bd:"rgba(22,163,74,0.2)",ic:"✓"},error:{bg:C.dangerLt,color:C.danger,bd:C.dangerBd,ic:"✕"},info:{bg:C.primaryLt,color:C.primary,bd:C.primaryBd,ic:"ℹ"}}[type]||{};
  return(<div style={{position:"fixed",bottom:24,right:24,zIndex:9999,display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:R.lg,background:m.bg,border:`1px solid ${m.bd}`,boxShadow:SH.lg,color:m.color,fontSize:13,fontWeight:500,fontFamily:FF,animation:"toastIn 0.25s ease"}}>{m.ic} {msg}<button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:m.color,fontSize:14,marginLeft:4,padding:0}}>✕</button></div>);
}

// ─── Product Form Drawer ──────────────────────────────────────────────────────
const BLANK={name:"",description:"",price:"",category:"",stock:"",status:"active",images:[]};
function validate(f){const e={};if(!f.name.trim())e.name="Name required";if(!f.category)e.category="Category required";if(!f.price||Number(f.price)<=0)e.price="Valid price required";if(f.stock==="")e.stock="Stock required";return e;}

function ProductForm({product,onSubmit,onCancel,busy,categories=[]}){
  const isEdit=Boolean(product);
  const defaultCategoryId = categories.length > 0 ? categories[0].id : "";
  
  // Find category ID for editing (product.category is the category NAME from API)
  const getInitialCategoryId = () => {
    if (!isEdit) return defaultCategoryId;
    if (!product.category) return defaultCategoryId;
    const found = categories.find(c => c.name === product.category);
    return found ? found.id : defaultCategoryId;
  };
  
  const initialCategory = isEdit ? getInitialCategoryId() : (defaultCategoryId || "");
  const [form,setForm]=useState(isEdit?{name:product.name,description:product.description||"",price:String(product.price),category:initialCategory,stock:String(product.stock),status:product.status,images:product.images||[]}:{...BLANK, category: defaultCategoryId});
  const [errs,setErrs]=useState({});
  const [previews,setPreviews]=useState(product?.images||[]);
  const [drag,setDrag]=useState(false);
  const fileRef=useRef();
  const [imageFiles, setImageFiles] = useState([]);  // Store actual File objects for upload
  const [variants, setVariants] = useState([]);  // Store product variants

  // Get category name for variant attribute lookup
  const selectedCategory = categories.find(c => c.id === form.category);
  const categoryAttributes = selectedCategory ? getAttributesForCategory(selectedCategory.name) : ["color", "size"];

  const set=(k,v)=>{setForm(f=>({...f,[k]:v}));if(errs[k])setErrs(e=>({...e,[k]:null}));};
  
  const submit=()=>{
    const e=validate(form);
    if(Object.keys(e).length){setErrs(e);return;}
    onSubmit({...form, price:Number(form.price), stock:Number(form.stock), imageFiles, variants});
  };
  const addFiles=(files)=>{
    const newFiles = [...imageFiles];
    const newPreviews = [...previews];
    
    [...files].forEach(f=>{
      if(!f.type.startsWith("image/")) return;
      const url=URL.createObjectURL(f);
      newFiles.push(f);  // Store the File object
      newPreviews.push(url);  // Store blob URL for preview
    });
    
    setImageFiles(newFiles);
    setPreviews(newPreviews);
    setForm(x=>({...x,images:newPreviews}));
  };

  const catOpts=categories.map(c=>({value:c.id,label:c.name}));
  const statusOpts=[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"},{value:"draft",label:"Draft"}];

  return(
    <>
      <div onClick={onCancel} style={{position:"fixed",inset:0,background:C.overlay,zIndex:1000,backdropFilter:"blur(4px)"}}/>
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:"100%",maxWidth:520,background:C.surface,zIndex:1001,display:"flex",flexDirection:"column",boxShadow:SH.xl,animation:"drawerIn 0.25s cubic-bezier(0.4,0,0.2,1)"}}>

        {/* Header */}
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{fontSize:10,fontWeight:600,color:C.primary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>{isEdit?"Edit":"New"} Product</div>
            <div style={{fontSize:17,fontWeight:700,color:C.text}}>{isEdit?product.name:"Add to your store"}</div>
          </div>
          <button onClick={onCancel} style={{width:32,height:32,borderRadius:R.md,border:`1px solid ${C.border}`,background:C.bg,cursor:"pointer",fontSize:15,color:C.muted,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>

        {/* Body */}
        <div style={{flex:1,overflowY:"auto",padding:24}}>
          <div style={{display:"flex",flexDirection:"column",gap:18}}>

            {/* Image Upload */}
            <div>
              <div style={{fontSize:12,fontWeight:500,color:C.sub,marginBottom:8}}>Product Images</div>
              <div onClick={()=>fileRef.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);addFiles(e.dataTransfer.files);}}
                style={{border:`1.5px dashed ${drag?C.primary:C.border}`,borderRadius:R.lg,padding:"22px",textAlign:"center",cursor:"pointer",background:drag?C.primaryLt:C.bg,transition:TR,marginBottom:10}}>
                <div style={{fontSize:24,marginBottom:6}}>🖼️</div>
                <div style={{fontSize:13,fontWeight:500,color:C.sub}}>{drag?"Drop to upload":"Click or drag & drop images"}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:3}}>PNG, JPG, WEBP · up to 10MB</div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e=>addFiles(e.target.files)}/>
              {previews.length>0&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                  {previews.map((src,i)=>(
                    <div key={i} style={{position:"relative",aspectRatio:"1"}}>
                      <img src={src} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:R.md,border:`1px solid ${C.border}`}}/>
                      <button onClick={()=>{setPreviews(p=>p.filter((_,idx)=>idx!==i));setImageFiles(f=>f.filter((_,idx)=>idx!==i));setForm(x=>({...x,images:x.images.filter((_,idx)=>idx!==i)}));}} style={{position:"absolute",top:4,right:4,width:24,height:24,borderRadius:R.sm,background:C.dangerLt,border:"none",color:C.danger,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Field label="Product Name" name="name" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. iPhone 15 Pro Max 256GB" required error={errs.name}/>
            <Field label="Description" name="description" value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Describe your product…" rows={3}/>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label="Price" type="number" name="price" value={form.price} onChange={e=>set("price",e.target.value)} placeholder="0.00" min="0" step="0.01" prefix="$" required error={errs.price}/>
              <Field label="Stock" type="number" name="stock" value={form.stock} onChange={e=>set("stock",e.target.value)} placeholder="0" min="0" required error={errs.stock}/>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <FSelect label="Category" name="category" value={form.category} onChange={e=>set("category",e.target.value)} options={catOpts} required/>
              <FSelect label="Status" name="status" value={form.status} onChange={e=>set("status",e.target.value)} options={statusOpts}/>
            </div>

            {/* Product Variants Manager */}
            {form.category ? (
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16,marginTop:4}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}}>Product Variants</div>
                <EnhancedVariantManager 
                  categoryId={form.category}
                  categoryName={selectedCategory?.name}
                  categoryAttributes={categoryAttributes}
                  productId={product?.id}
                  existingVariants={variants}
                  onVariantsUpdate={(updatedVariants) => setVariants(updatedVariants)}
                />
              </div>
            ) : (
              <div style={{background:C.primaryLt,border:`1px solid ${C.primaryBd}`,borderRadius:R.md,padding:12,fontSize:13,color:C.primary}}>
                ℹ️ Select a category above to add product variants
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:"16px 24px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,justifyContent:"flex-end",flexShrink:0}}>
          <Btn label="Cancel" onClick={onCancel} variant="outline"/>
          <Btn label={busy?(isEdit?"Saving…":"Adding…"):(isEdit?"Save Changes":"Add Product")} onClick={submit} variant="primary" disabled={busy} icon={busy?undefined:isEdit?"✓":"+"}/>
        </div>
      </div>
    </>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────
function ConfirmModal({title,msg,onOk,onClose,busy}){
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:C.overlay,display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:20,backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:R.xl,padding:"28px",maxWidth:400,width:"100%",boxShadow:SH.xl,fontFamily:FF}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:10}}>{title}</div>
        <div style={{fontSize:13,color:C.sub,lineHeight:1.6,marginBottom:24}}>{msg}</div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn label="Cancel" onClick={onClose} variant="outline"/>
          <Btn label={busy?"Deleting…":"Delete"} onClick={onOk} variant="dangerSolid" disabled={busy}/>
        </div>
      </div>
    </div>
  );
}

function StockModal({product,onSave,onClose,busy}){
  const [val,setVal]=useState(String(product.stock));
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:C.overlay,display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:20,backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:R.xl,padding:"24px",maxWidth:340,width:"100%",boxShadow:SH.xl,fontFamily:FF}}>
        <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>Update Stock</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:18}}>{product.name}</div>
        <Field label="Quantity" type="number" min="0" value={val} onChange={e=>setVal(e.target.value)}/>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:18}}>
          <Btn label="Cancel" onClick={onClose} variant="outline"/>
          <Btn label={busy?"Saving…":"Update"} onClick={()=>onSave(val)} variant="primary" disabled={busy}/>
        </div>
      </div>
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────
function TRow({p,cols,onEdit,onDel,onStock,onToggle,onView}){
  const [h,setH]=useState(false);
  const low=p.stock>0&&p.stock<=10,out=p.stock===0;
  const date=new Date(p.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
      return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:"grid",gridTemplateColumns:cols,padding:"11px 20px",alignItems:"center",borderBottom:`1px solid ${C.borderLt}`,background:h?C.bg:C.surface,transition:TR}}>
      <div style={{display:"flex",alignItems:"center",gap:11,minWidth:0}}>
        <img src={p.images?.[0]||"https://via.placeholder.com/80?text=No+Image&bg=f0f0f0&tc=999"} alt="" style={{width:38,height:38,borderRadius:R.md,objectFit:"cover",border:`1px solid ${C.border}`,flexShrink:0}}/>
        <div style={{minWidth:0}}>
          <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:1}}>{p.sales} sold</div>
        </div>
      </div>
      <div style={{fontSize:12,color:C.sub}}>{p.category}</div>
      <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text}}>${p.price.toLocaleString()}</div>
        {p.originalPrice ? <div style={{fontSize:11,color:C.muted,textDecoration:"line-through"}}>${p.originalPrice.toLocaleString()}</div> : null}
        {p.discountLabel ? <div style={{fontSize:10,fontWeight:700,color:C.red,background:C.redBg,padding:"2px 6px",borderRadius:4}}>{p.discountLabel}</div> : null}
      </div>
      <div style={{fontSize:13,fontWeight:500,color:out?C.danger:low?C.warning:C.text}}>{out?"Out":p.stock}{low&&<span style={{fontSize:10}}> ⚠</span>}</div>
      <StatusBadge status={p.status}/>
      <div style={{fontSize:11,color:C.muted}}>{date}</div>
      <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
               <Btn label="View"  onClick={()=>onView(p)} variant="outline" size="sm" icon="↗"/>
               <Btn label="Edit"  onClick={()=>onEdit(p)}    variant="ghost"  size="sm" icon="✎"/>
               <Btn label="Stock" onClick={()=>onStock(p)}   variant="ghost"  size="sm" icon="⊞"/>
               <Btn label={p.status==="active"?"Hide":"Show"} onClick={()=>onToggle(p.id)} variant="ghost" size="sm"/>
               <Btn label="✕"    onClick={()=>onDel(p)}     variant="danger" size="sm"/>
      </div>
    </div>
  );
}

// ─── Product Card (Grid / Mobile) ─────────────────────────────────────────────
function PCard({p,onEdit,onDel,onStock,onToggle,onView}){
  const low=p.stock>0&&p.stock<=10,out=p.stock===0;
  const date=new Date(p.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"});
  return(
    <div style={{background:C.surface,borderRadius:R.lg,border:`1px solid ${C.border}`,overflow:"hidden"}}>
      <div style={{position:"relative"}}>
        <img src={p.images?.[0]||"https://via.placeholder.com/400?text=No+Image&bg=f0f0f0&tc=999"} alt="" style={{width:"100%",aspectRatio:"4/3",objectFit:"cover",display:"block"}}/>
        <div style={{position:"absolute",top:8,left:8}}><StatusBadge status={p.status}/></div>
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:1}}>{p.name}</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:10}}>{p.category} · {date}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
            <div style={{fontSize:15,fontWeight:800,color:C.text}}>${p.price.toLocaleString()}</div>
            {p.originalPrice ? <div style={{fontSize:11,color:C.muted,textDecoration:"line-through"}}>${p.originalPrice.toLocaleString()}</div> : null}
            {p.discountLabel ? <div style={{fontSize:10,fontWeight:700,color:C.red,background:C.redBg,padding:"2px 6px",borderRadius:4}}>{p.discountLabel}</div> : null}
          </div>
          <div style={{fontSize:11,fontWeight:500,color:out?C.danger:low?C.warning:C.sub}}>{out?"Out of stock":`${p.stock} in stock`}{low&&" ⚠"}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          <Btn label="View"   onClick={()=>onView(p)}   variant="outline" size="sm" fullWidth icon="↗"/>
          <Btn label="Edit"   onClick={()=>onEdit(p)}   variant="outline" size="sm" fullWidth icon="✎"/>
          <Btn label="Stock"  onClick={()=>onStock(p)}  variant="outline" size="sm" fullWidth icon="⊞"/>
          <Btn label={p.status==="active"?"Deactivate":"Activate"} onClick={()=>onToggle(p.id)} variant="ghost" size="sm" fullWidth/>
          <Btn label="Delete" onClick={()=>onDel(p)}    variant="danger"  size="sm" fullWidth/>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function Stat({label,value,icon,accent}){
  return(
    <div style={{background:C.surface,borderRadius:R.lg,border:`1px solid ${C.border}`,padding:"15px 18px",flex:1,minWidth:0,display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:38,height:38,borderRadius:R.md,flexShrink:0,background:accent?`${accent}14`:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{icon}</div>
      <div>
        <div style={{fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>{label}</div>
        <div style={{fontSize:20,fontWeight:700,color:accent||C.text,lineHeight:1}}>{value}</div>
      </div>
    </div>
  );
}

// ─── Filters Bar ─────────────────────────────────────────────────────────────
function Filters({f,set,total,view,setView,isMobile,categories=[]}){
  const [sf,setSf]=useState(false);
  const sel=(foc)=>({padding:"8px 26px 8px 10px",borderRadius:R.md,fontFamily:FF,border:`1px solid ${foc?C.primary:C.border}`,background:C.surface,color:C.text,fontSize:12,cursor:"pointer",outline:"none",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg width='9' height='5' viewBox='0 0 9 5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l3.5 3L8 1' stroke='%23a09f97' stroke-width='1.3' stroke-linecap='round' fill='none'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 8px center",transition:TR});
  return(
    <div style={{background:C.surface,borderRadius:R.lg,border:`1px solid ${C.border}`,padding:"12px 16px",display:"flex",flexWrap:"wrap",gap:10,alignItems:"center"}}>
      <div style={{flex:"1 1 180px",position:"relative",display:"flex",alignItems:"center"}}>
        <span style={{position:"absolute",left:10,color:C.muted,fontSize:15,pointerEvents:"none"}}>⌕</span>
        <input value={f.search} onChange={e=>set("search",e.target.value)} onFocus={()=>setSf(true)} onBlur={()=>setSf(false)} placeholder="Search products…"
          style={{width:"100%",padding:"8px 32px 8px 30px",borderRadius:R.md,fontFamily:FF,fontSize:12,border:`1px solid ${sf?C.primary:C.border}`,background:C.bg,color:C.text,outline:"none",transition:TR,boxSizing:"border-box"}}/>
        {f.search&&<button onClick={()=>set("search","")} style={{position:"absolute",right:8,background:"none",border:"none",cursor:"pointer",fontSize:12,color:C.muted,padding:0}}>✕</button>}
      </div>
      <select value={f.category} onChange={e=>set("category",e.target.value)} style={sel(false)}>
        <option value="all">All Categories</option>
        {categories.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
      </select>
      <select value={f.stock} onChange={e=>set("stock",e.target.value)} style={sel(false)}>
        <option value="all">All Stock</option>
        <option value="ok">In Stock (10+)</option>
        <option value="low">Low Stock (≤10)</option>
        <option value="out">Out of Stock</option>
      </select>
      <select value={f.sort} onChange={e=>set("sort",e.target.value)} style={sel(false)}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="price_desc">Price ↓</option>
        <option value="price_asc">Price ↑</option>
      </select>
      <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
        <span style={{fontSize:12,color:C.muted,whiteSpace:"nowrap"}}>{total} products</span>
        {!isMobile&&(
          <div style={{display:"flex",border:`1px solid ${C.border}`,borderRadius:R.md,overflow:"hidden"}}>
            {[["table","☰"],["grid","⊞"]].map(([v,ic])=>(
              <button key={v} onClick={()=>setView(v)} style={{padding:"6px 10px",border:"none",background:view===v?C.primary:C.surface,color:view===v?"#fff":C.muted,cursor:"pointer",fontSize:13,transition:TR}}>{ic}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SellerProducts() {
  const navigate = useNavigate();
  const [width,setWidth]=useState(window.innerWidth);
  useEffect(()=>{const h=()=>setWidth(window.innerWidth);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  const isMobile=width<768, isTablet=width<1024;

  const [products,setProducts]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [categories,setCategories]=useState([]);
  const [filters,setFilters]=useState({search:"",category:"all",stock:"all",sort:"newest"});
  const [view,setView]=useState("table");

  const [formOpen,setFormOpen]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [delItem,setDelItem]=useState(null);
  const [stockItem,setStockItem]=useState(null);
  const [busy,setBusy]=useState(false);
  const [toast,setToast]=useState(null);
  const srchRef=useRef(null);

  const showToast=useCallback((msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3000);},[]);

  // Fetch categories on mount
  useEffect(()=>{
    const fetchCategories=async()=>{
      try{
        const data=await getCategories();
        setCategories(Array.isArray(data)?data:[]);
      }catch(e){
        console.error("Failed to load categories:",e);
        setCategories([]);
      }
    };
    fetchCategories();
  },[]);

  const load=useCallback(async(f=filters)=>{
    try{setLoading(true);setError(null);setProducts(await api.list(f));}
    catch(e){setError(e.message||"Failed to load");}
    finally{setLoading(false);}
  },[filters]);

  useEffect(()=>{load();},[]);// eslint-disable-line

  const setF=useCallback((k,v)=>{
    const next={...filters,[k]:v};setFilters(next);
    if(k==="search"){clearTimeout(srchRef.current);srchRef.current=setTimeout(()=>load(next),350);}
    else load(next);
  },[filters,load]);

  const handleFormSubmit=async(payload)=>{
    try{
      setBusy(true);
      const { imageFiles, variants, ...productData } = payload;
      
      if(editItem){
        const u=await api.update(editItem.id, productData);
        setProducts(ps=>ps.map(p=>p.id===editItem.id?u:p));
        showToast("Product updated");
      }
      else{
        const n=await api.create(productData);
        
        // Upload images for new product
        if(imageFiles && imageFiles.length > 0){
          try{
            await uploadProductImages(n.id, imageFiles);
          }catch(imgErr){
            console.error("Image upload error:", imgErr);
            throw new Error(imgErr?.response?.data?.message || "Product created, but image upload failed. Please try uploading images again.");
          }
        }
        
        // Create variants for new product
        if(variants && variants.length > 0){
          try{
            for(const variant of variants){
              const { images, ...variantData } = variant;
              // Create the variant
              const createdVariant = await createVariant(n.id, variantData);
              // Upload variant images
              if(images && images.length > 0){
                for(const imageFile of images){
                  if(imageFile instanceof File){
                    await uploadImage(createdVariant.id, imageFile);
                  }
                }
              }
            }
          }catch(varErr){
            console.warn("Variant creation error:", varErr);
            showToast("Warning: Some variants failed to create.", "warning");
          }
        }
        
        // Reload product to get updated variants and images
        const updated = await getProducts();
        const reloaded = updated.find(p => p.id === n.id);
        setProducts(ps=>[reloaded || n,...ps]);
        showToast("Product added");
      }
      setFormOpen(false);
      setEditItem(null);
    }catch(e){
      showToast(e.message||"Error","error");
    }finally{
      setBusy(false);
    }
  };
  const handleDelete=async()=>{
    try{setBusy(true);await api.remove(delItem.id);setProducts(ps=>ps.filter(p=>p.id!==delItem.id));showToast("Product deleted");setDelItem(null);}
    catch(e){showToast(e.message||"Error","error");}finally{setBusy(false);}
  };
  const handleStock=async(val)=>{
    try{setBusy(true);const u=await api.stock(stockItem.id,val);setProducts(ps=>ps.map(p=>p.id===stockItem.id?u:p));showToast("Stock updated");setStockItem(null);}
    catch(e){showToast(e.message||"Error","error");}finally{setBusy(false);}
  };
  const handleToggle=async(id)=>{
    try{const u=await api.toggle(id);setProducts(ps=>ps.map(p=>p.id===id?u:p));showToast("Status updated");}
    catch(e){showToast(e.message||"Error","error");}
  };

  const handleView = (product) => {
    navigate(`/seller/products/${product.id}`);
  };

  const stats={
    total:products.length,
    active:products.filter(p=>p.status==="active").length,
    low:products.filter(p=>p.stock>0&&p.stock<=10).length,
    revenue:`$${(products.reduce((s,p)=>s+p.price*p.sales,0)/1000).toFixed(0)}K`,
  };
  const hasFilters=filters.search||filters.category!=="all"||filters.stock!=="all";
  const COLS="2.5fr 0.9fr 0.8fr 0.6fr 1fr 0.9fr 1.1fr";

  return(
    <div style={{fontFamily:FF,background:C.bg,minHeight:"100vh",color:C.text}}>
      <style>{FONT}</style>

      <div style={{maxWidth:1280,margin:"0 auto",padding:isMobile?"18px 14px":"28px 28px"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:22}}>
          <div>
            <div style={{fontSize:10,fontWeight:600,color:C.primary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Seller Dashboard</div>
            <h1 style={{fontSize:isMobile?20:26,fontWeight:700,color:C.text,margin:0,lineHeight:1.2}}>My Products</h1>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn label="Refresh" onClick={()=>load(filters)} variant="outline" icon="↻"/>
            <Btn label="Add Product" onClick={()=>{setEditItem(null);setFormOpen(true);}} variant="primary" icon="+"/>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"flex",gap:12,marginBottom:18,flexWrap:isMobile?"wrap":"nowrap"}}>
          <Stat label="Total" value={stats.total} icon="📦"/>
          <Stat label="Active" value={stats.active} icon="✅" accent={C.success}/>
          <Stat label="Low Stock" value={stats.low} icon="⚠️" accent={C.warning}/>
          {!isMobile&&<Stat label="Est. Revenue" value={stats.revenue} icon="💰" accent={C.primary}/>}
        </div>

        {/* Filters */}
        <div style={{marginBottom:14}}>
          <Filters f={filters} set={setF} total={products.length} view={view} setView={setView} isMobile={isMobile} categories={categories}/>
        </div>

        {/* Content */}
        {loading?(
          <div style={{background:C.surface,borderRadius:R.lg,border:`1px solid ${C.border}`}}><Spinner/></div>
        ):error?(
          <div style={{background:C.surface,borderRadius:R.lg,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",padding:"64px 24px",textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:14}}>⚠️</div>
            <div style={{fontSize:15,fontWeight:600,marginBottom:8}}>Something went wrong</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:20}}>{error}</div>
            <Btn label="Try Again" onClick={()=>load(filters)} variant="outline" icon="↻"/>
          </div>
        ):products.length===0?(
          <div style={{background:C.surface,borderRadius:R.lg,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",padding:"72px 24px",textAlign:"center"}}>
            <div style={{width:56,height:56,borderRadius:R.xl,background:C.primaryLt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:18}}>📦</div>
            <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>{hasFilters?"No products match your filters":"No products yet"}</div>
            <div style={{fontSize:13,color:C.muted,maxWidth:280,lineHeight:1.6,marginBottom:22}}>{hasFilters?"Try adjusting your search or filter criteria.":"Start by adding your first product."}</div>
            {hasFilters
              ?<Btn label="Clear Filters" onClick={()=>{const def={search:"",category:"all",stock:"all",sort:"newest"};setFilters(def);load(def);}} variant="outline" icon="✕"/>
              :<Btn label="Add Product" onClick={()=>setFormOpen(true)} variant="primary" icon="+"/>}
          </div>
        ):(isMobile||isTablet||view==="grid")?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:12}}>
            {products.map(p=><PCard key={p.id} p={p} onEdit={x=>{setEditItem(x);setFormOpen(true);}} onDel={setDelItem} onStock={setStockItem} onToggle={handleToggle} onView={handleView}/>) }
          </div>
        ):(
          <div style={{background:C.surface,borderRadius:R.lg,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:COLS,padding:"10px 20px",borderBottom:`1px solid ${C.border}`,background:C.bg}}>
              {["Product","Category","Price","Stock","Status","Created","Actions"].map(h=>(
                <div key={h} style={{fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</div>
              ))}
            </div>
            {products.map(p=><TRow key={p.id} p={p} cols={COLS} onEdit={x=>{setEditItem(x);setFormOpen(true);}} onDel={setDelItem} onStock={setStockItem} onToggle={handleToggle} onView={handleView}/>)}
          </div>
        )}
      </div>

      {formOpen&&<ProductForm product={editItem} onSubmit={handleFormSubmit} onCancel={()=>{setFormOpen(false);setEditItem(null);}} busy={busy} categories={categories}/>}
      {delItem&&<ConfirmModal title="Delete Product" msg={`Delete "${delItem.name}"? This cannot be undone.`} onOk={handleDelete} onClose={()=>setDelItem(null)} busy={busy}/>}
      {stockItem&&<StockModal product={stockItem} onSave={handleStock} onClose={()=>setStockItem(null)} busy={busy}/>}
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );
}