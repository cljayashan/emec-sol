import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { preInspectionRecommendationService } from '../../services/preInspectionRecommendationService';

const PreInspectionRecommendationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [preInspectionRecommendation, setPreInspectionRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreInspectionRecommendation();
  }, [id]);

  const loadPreInspectionRecommendation = async () => {
    try {
      const response = await preInspectionRecommendationService.getById(id);
      setPreInspectionRecommendation(response.data.data);
    } catch (error) {
      toast.error('Failed to load pre inspection recommendation');
      navigate('/pre-inspection-recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!preInspectionRecommendation) return <div>Pre inspection recommendation not found</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Pre Inspection Recommendation Details</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/pre-inspection-recommendations')}>
          Back to List
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        <div>
          <strong>Name:</strong> {preInspectionRecommendation.name}
        </div>
        <div>
          <strong>Description:</strong> {preInspectionRecommendation.description || 'N/A'}
        </div>
        <div>
          <strong>Created At:</strong> {new Date(preInspectionRecommendation.created_at).toLocaleString()}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => navigate(`/pre-inspection-recommendations/${id}/edit`)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default PreInspectionRecommendationView;

