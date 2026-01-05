import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { itemService } from '../../services/itemService';
import { itemCategoryService } from '../../services/itemCategoryService';
import { useForm } from '../../hooks/useForm';
import AutoComplete from '../common/AutoComplete';

const ItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { values, handleChange, setValue, reset } = useForm({
    item_name: '',
    description: '',
    brand: '',
    category_id: '',
    barcode: '',
    measurement_unit: ''
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadItem();
    }
  }, [id]);

  useEffect(() => {
    // Update selected category when categories are loaded and we have a category_id
    if (categories.length > 0 && values.category_id) {
      const category = categories.find(cat => cat.id === values.category_id);
      if (category && (!selectedCategory || selectedCategory.id !== category.id)) {
        setSelectedCategory(category);
      }
    } else if (!values.category_id) {
      setSelectedCategory(null);
    }
  }, [categories, values.category_id]);

  const loadCategories = async () => {
    try {
      const response = await itemCategoryService.getAll(1, 1000);
      setCategories(response.data.data.data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const loadItem = async () => {
    try {
      const response = await itemService.getById(id);
      const item = response.data.data;
      setValue('item_name', item.item_name);
      setValue('description', item.description || '');
      setValue('brand', item.brand || '');
      setValue('category_id', item.category_id || '');
      setValue('barcode', item.barcode || '');
      setValue('measurement_unit', item.measurement_unit || '');
    } catch (error) {
      toast.error('Failed to load item');
      navigate('/items');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...values,
        category_id: values.category_id || null
      };
      if (isEdit) {
        await itemService.update(id, data);
        toast.success('Item updated successfully');
      } else {
        await itemService.create(data);
        toast.success('Item created successfully');
      }
      navigate('/items');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{isEdit ? 'Edit Item' : 'Add New Item'}</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Item Name *</label>
          <input
            type="text"
            name="item_name"
            value={values.item_name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={values.description}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Brand</label>
          <input
            type="text"
            name="brand"
            value={values.brand}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Category</label>
          <AutoComplete
            items={categories}
            onSelect={(category) => {
              if (category) {
                setSelectedCategory(category);
                setValue('category_id', category.id);
              } else {
                setSelectedCategory(null);
                setValue('category_id', '');
              }
            }}
            placeholder="Search category..."
            searchKey="name"
            value={selectedCategory?.name || ''}
          />
        </div>
        
        <div className="form-group">
          <label>Barcode</label>
          <input
            type="text"
            name="barcode"
            value={values.barcode}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Measurement Unit</label>
          <input
            type="text"
            name="measurement_unit"
            value={values.measurement_unit}
            onChange={handleChange}
            placeholder="e.g., kg, liter, piece"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/items')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;

