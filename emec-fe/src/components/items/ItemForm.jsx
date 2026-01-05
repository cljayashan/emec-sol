import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { itemService } from '../../services/itemService';
import { itemCategoryService } from '../../services/itemCategoryService';
import { brandService } from '../../services/brandService';
import { useForm } from '../../hooks/useForm';
import AutoComplete from '../common/AutoComplete';
import { MEASUREMENT_UNITS } from '../../utils/constants';

const ItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { values, handleChange, setValue, reset } = useForm({
    item_name: '',
    description: '',
    brand_id: '',
    category_id: '',
    barcode: '',
    measurement_unit: ''
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedMeasurementUnit, setSelectedMeasurementUnit] = useState(null);

  // Transform measurement units array into objects for AutoComplete
  const measurementUnitsList = useMemo(() => {
    return MEASUREMENT_UNITS.map(unit => ({ name: unit }));
  }, []);

  useEffect(() => {
    loadCategories();
    loadBrands();
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

  useEffect(() => {
    // Update selected brand when brands are loaded and we have a brand_id
    if (brands.length > 0 && values.brand_id) {
      const brand = brands.find(b => b.id === values.brand_id);
      if (brand && (!selectedBrand || selectedBrand.id !== brand.id)) {
        setSelectedBrand(brand);
      }
    } else if (!values.brand_id) {
      setSelectedBrand(null);
    }
  }, [brands, values.brand_id]);

  useEffect(() => {
    // Update selected measurement unit when measurement_unit value changes
    if (values.measurement_unit) {
      const unit = measurementUnitsList.find(u => u.name === values.measurement_unit);
      if (unit && (!selectedMeasurementUnit || selectedMeasurementUnit.name !== unit.name)) {
        setSelectedMeasurementUnit(unit);
      }
    } else {
      setSelectedMeasurementUnit(null);
    }
  }, [values.measurement_unit, measurementUnitsList]);

  const loadCategories = async () => {
    try {
      const response = await itemCategoryService.getAll(1, 1000);
      setCategories(response.data.data.data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const loadBrands = async () => {
    try {
      const response = await brandService.getAll(1, 1000);
      setBrands(response.data.data.data);
    } catch (error) {
      toast.error('Failed to load vehicle brands');
    }
  };

  const loadItem = async () => {
    try {
      const response = await itemService.getById(id);
      const item = response.data.data;
      setValue('item_name', item.item_name);
      setValue('description', item.description || '');
      setValue('brand_id', item.brand_id || '');
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
        category_id: values.category_id || null,
        brand_id: values.brand_id || null
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
          <label>Vehicle Brand</label>
          <AutoComplete
            items={brands}
            onSelect={(brand) => {
              if (brand) {
                setSelectedBrand(brand);
                setValue('brand_id', brand.id);
              } else {
                setSelectedBrand(null);
                setValue('brand_id', '');
              }
            }}
            placeholder="Search vehicle brand..."
            searchKey="name"
            value={selectedBrand?.name || ''}
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
          <AutoComplete
            items={measurementUnitsList}
            onSelect={(unit) => {
              if (unit) {
                setSelectedMeasurementUnit(unit);
                setValue('measurement_unit', unit.name);
              } else {
                setSelectedMeasurementUnit(null);
                setValue('measurement_unit', '');
              }
            }}
            placeholder="Search measurement unit..."
            searchKey="name"
            value={selectedMeasurementUnit?.name || ''}
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

