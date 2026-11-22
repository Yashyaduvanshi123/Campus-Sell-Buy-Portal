import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Plus, AlertCircle, ArrowLeft, CheckCircle2, Sparkles, Tag, DollarSign, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const fallbackCategories = [
  { id: 1, name: 'Electronics', slug: 'electronics' },
  { id: 2, name: 'Books', slug: 'books' },
  { id: 3, name: 'Notes', slug: 'notes' },
  { id: 4, name: 'Furniture', slug: 'furniture' },
  { id: 5, name: 'Sports Equipment', slug: 'sports-equipment' },
  { id: 6, name: 'Fashion', slug: 'fashion' },
  { id: 7, name: 'Accessories', slug: 'accessories' },
  { id: 8, name: 'Other Products', slug: 'other-products' }
];

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    price: '',
    original_price: '',
    product_condition: 'Good',
    campus: user?.campus || 'North Campus Hostel 4',
    description: '',
    allow_whatsapp: false
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success && res.data.data?.length > 0) {
          setCategories(res.data.data);
          setFormData((prev) => ({ ...prev, category_id: res.data.data[0].id }));
        } else {
          setCategories(fallbackCategories);
          setFormData((prev) => ({ ...prev, category_id: fallbackCategories[0].id }));
        }
      } catch (err) {
        setCategories(fallbackCategories);
        setFormData((prev) => ({ ...prev, category_id: fallbackCategories[0].id }));
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 images per product.');
      return;
    }

    const validFiles = [];
    const validPreviews = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" is larger than 5MB limit.`);
        continue;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        toast.error(`"${file.name}" is not a supported image file (JPEG, PNG, WebP).`);
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setImages((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...validPreviews]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a product title.');
      return;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      toast.error('Please enter a valid selling price.');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a detailed description.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('category_id', formData.category_id);
      data.append('price', formData.price);
      if (formData.original_price) {
        data.append('original_price', formData.original_price);
      }
      data.append('product_condition', formData.product_condition);
      data.append('campus', formData.campus.trim());
      data.append('description', formData.description.trim());
      data.append('allow_whatsapp', formData.allow_whatsapp);

      images.forEach((file) => {
        data.append('images', file);
      });

      const res = await api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Product listed successfully!');
        navigate(`/products/${res.data.productId}`);
      } else {
        toast.success('Listing created successfully!');
        navigate('/browse');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to list product.');
    } finally {
      setSubmitting(false);
    }
  };

  const conditions = ['Brand New', 'Like New', 'Good', 'Fair'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 bg-[#F3EFE7]">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D7]">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B7075] hover:text-[#292D32] mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#B9A58A]" />
            Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#292D32] tracking-tight">
            List an Item for Sale
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7075] mt-1">
            Post your textbook, gadget, or campus essentials to fellow college peers.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Photos */}
        <div className="bg-white rounded-3xl border border-[#E5E0D7] p-6 sm:p-7 shadow-subtle space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-[#292D32]">Product Photos</h2>
            <p className="text-xs text-[#6B7075]">Upload up to 5 clear photos. First image will be your primary cover.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
            {previews.map((previewUrl, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-[#E5E0D7] group shadow-xs">
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute bottom-2 left-2 bg-[#292D32]/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-md transition-opacity cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {previews.length < 5 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-[#B9A58A] hover:border-[#292D32] hover:bg-[#ECE7DE]/50 flex flex-col items-center justify-center cursor-pointer transition-all p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-[#ECE7DE] flex items-center justify-center text-[#292D32] mb-2 border border-[#E5E0D7]">
                  <Upload className="w-5 h-5 text-[#B9A58A]" />
                </div>
                <span className="text-xs font-bold text-[#292D32]">Add Photo</span>
                <span className="text-[10px] text-[#6B7075] mt-0.5">JPEG, PNG, WebP</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Section 2: Details */}
        <div className="bg-white rounded-3xl border border-[#E5E0D7] p-6 sm:p-7 shadow-subtle space-y-6">
          <h2 className="text-base font-extrabold text-[#292D32]">Product Details</h2>

          <div>
            <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Casio FX-991EX Scientific Calculator / Data Structures Book"
              className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#B9A58A]/30 focus:border-[#B9A58A] text-[#292D32]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#B9A58A]/30 focus:border-[#B9A58A] bg-white text-[#292D32]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                Campus / Hostel Location
              </label>
              <input
                type="text"
                name="campus"
                value={formData.campus}
                onChange={handleInputChange}
                placeholder="e.g. North Campus Hostel 4 or Library"
                className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#B9A58A]/30 focus:border-[#B9A58A] text-[#292D32]"
              />
            </div>
          </div>

          {/* Condition Selector */}
          <div>
            <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-2">
              Item Condition *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {conditions.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, product_condition: cond }))}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    formData.product_condition === cond
                      ? 'bg-[#292D32] text-white border-[#292D32] shadow-xs'
                      : 'bg-white text-[#6B7075] border-[#E5E0D7] hover:bg-[#ECE7DE]'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                Selling Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7075] font-bold">₹</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="850"
                  className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl pl-8 pr-3.5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#B9A58A]/30 focus:border-[#B9A58A] text-[#292D32]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                Original Price (₹) (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7075] font-bold">₹</span>
                <input
                  type="number"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleInputChange}
                  placeholder="1595"
                  className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl pl-8 pr-3.5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#B9A58A]/30 focus:border-[#B9A58A] text-[#292D32]"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
              Detailed Description *
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe condition, edition, accessories included, reason for selling, and preferred campus handover spot..."
              className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#B9A58A]/30 focus:border-[#B9A58A] text-[#292D32]"
              required
            />
          </div>

          {/* WhatsApp toggle */}
          <div className="flex items-center pt-2">
            <input
              id="allow_whatsapp"
              type="checkbox"
              name="allow_whatsapp"
              checked={formData.allow_whatsapp}
              onChange={handleInputChange}
              className="w-4 h-4 text-[#292D32] border-[#E5E0D7] rounded focus:ring-[#B9A58A]"
            />
            <label htmlFor="allow_whatsapp" className="ml-2.5 block text-xs font-semibold text-[#292D32] cursor-pointer">
              Allow verified students to reach out via WhatsApp on my registered phone
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#292D32] hover:bg-[#1F2226] active:bg-[#141618] disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg shadow-[#292D32]/25 border border-[#B9A58A]/30 transition-all cursor-pointer"
          >
            {submitting ? 'Publishing Listing...' : 'Publish Product Listing'}
          </button>
        </div>

      </form>

    </div>
  );
};

export default AddProduct;
