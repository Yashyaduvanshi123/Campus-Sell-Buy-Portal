import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl, handleImageError, DEFAULT_PRODUCT_PLACEHOLDER } from '../utils/formatters';
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

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    price: '',
    original_price: '',
    product_condition: 'Good',
    campus: '',
    description: '',
    allow_whatsapp: false,
    status: 'active'
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories').catch(() => ({ data: { success: false } })),
          api.get(`/products/${id}`).catch(() => ({ data: { success: false } }))
        ]);

        if (catRes.data?.success && catRes.data.data) {
          setCategories(catRes.data.data);
        } else {
          setCategories(fallbackCategories);
        }

        if (prodRes.data?.success && prodRes.data.data) {
          const p = prodRes.data.data;

          // Authorization guard: Student can only edit their own listing
          if (user && p.seller_id && user.id !== p.seller_id) {
            toast.error('Unauthorized. You can only edit your own listings.');
            navigate('/dashboard/my-products');
            return;
          }

          setFormData({
            title: p.title || '',
            category_id: p.category_id || '',
            price: p.price || '',
            original_price: p.original_price || '',
            product_condition: p.product_condition || 'Good',
            campus: p.campus || '',
            description: p.description || '',
            allow_whatsapp: !!p.allow_whatsapp,
            status: p.status || 'active'
          });
          setExistingImages(p.images || []);
        } else {
          toast.error('Listing not found or unavailable.');
          navigate('/dashboard/my-products');
          return;
        }
      } catch (err) {
        toast.error('Failed to load listing for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + newImages.length + files.length > 5) {
      toast.error('Maximum 5 images allowed per listing.');
      return;
    }

    const validFiles = [];
    const validPreviews = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 5MB limit.`);
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setNewImages((prev) => [...prev, ...validFiles]);
    setNewPreviews((prev) => [...prev, ...validPreviews]);
  };

  const handleRemoveNewImage = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      data.append('status', formData.status);

      newImages.forEach((file) => {
        data.append('images', file);
      });

      const res = await api.put(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        toast.success('Listing updated successfully!');
        navigate(`/products/${id}`);
      } else {
        toast.error(res.data?.message || 'Failed to update listing.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const conditions = ['Brand New', 'Like New', 'Good', 'Fair'];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center bg-[#F3EFE7]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#292D32] mx-auto"></div>
      </div>
    );
  }

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
            Edit Product Listing
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7075] mt-1">
            Update pricing, photos, or status for your campus listing.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Photos */}
        <div className="bg-white rounded-3xl border border-[#E5E0D7] p-6 sm:p-7 shadow-subtle space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-[#292D32]">Manage Photos</h2>
            <p className="text-xs text-[#6B7075]">Existing images and new uploads. Up to 5 total images.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
            {existingImages.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-[#E5E0D7] shadow-xs">
                <img
                  src={getMediaUrl(img.image_url, DEFAULT_PRODUCT_PLACEHOLDER)}
                  alt="product"
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute bottom-2 left-2 bg-[#292D32]/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Cover
                  </span>
                )}
              </div>
            ))}

            {newPreviews.map((previewUrl, idx) => (
              <div key={`new-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border border-[#E5E0D7] group shadow-xs">
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveNewImage(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-md transition-opacity cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {existingImages.length + newImages.length < 5 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-[#B9A58A] hover:border-[#292D32] hover:bg-[#ECE7DE]/50 flex flex-col items-center justify-center cursor-pointer transition-all p-4 text-center">
                <Upload className="w-5 h-5 text-[#B9A58A] mb-1" />
                <span className="text-xs font-bold text-[#292D32]">Add More</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleNewImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Section 2: Details */}
        <div className="bg-white rounded-3xl border border-[#E5E0D7] p-6 sm:p-7 shadow-subtle space-y-6">
          <h2 className="text-base font-extrabold text-[#292D32]">Listing Details</h2>

          <div>
            <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
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
                Listing Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#B9A58A]/30 focus:border-[#B9A58A] bg-white text-[#292D32]"
              >
                <option value="active">Active (Available for sale)</option>
                <option value="sold">Sold Out</option>
              </select>
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
                  className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl pl-8 pr-3.5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#B9A58A]/30 focus:border-[#B9A58A] text-[#292D32]"
                />
              </div>
            </div>
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
              className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#B9A58A]/30 focus:border-[#B9A58A] text-[#292D32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
              Detailed Description *
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#B9A58A]/30 focus:border-[#B9A58A] text-[#292D32]"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#292D32] hover:bg-[#1F2226] active:bg-[#141618] disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg shadow-[#292D32]/25 border border-[#B9A58A]/30 transition-all cursor-pointer"
          >
            {submitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>

      </form>

    </div>
  );
};

export default EditProduct;
