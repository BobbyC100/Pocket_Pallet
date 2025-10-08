import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Eye, ArrowLeft } from 'lucide-react';
import { wineApi } from '@/services/api';
import toast from 'react-hot-toast';

const wineSchema = z.object({
  producer_id: z.number().min(1, 'Producer is required'),
  cuvee: z.string().optional(),
  vintage: z.number().min(1900).max(2100).optional().nullable(),
  is_nv: z.boolean(),
  abv: z.number().min(5).max(18).optional().nullable(),
  wine_type: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.vintage || data.is_nv, {
  message: 'Must specify vintage or mark as non-vintage',
  path: ['vintage'],
});

type WineFormData = z.infer<typeof wineSchema>;

export const WineForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<WineFormData>({
    resolver: zodResolver(wineSchema),
    defaultValues: {
      is_nv: false,
    },
  });
  
  const isNv = watch('is_nv');
  
  // Auto-save draft
  useEffect(() => {
    if (!isDirty) return;
    
    const timer = setTimeout(async () => {
      setAutoSaving(true);
      try {
        const data = watch();
        await wineApi.saveDraft(data, id ? parseInt(id) : undefined);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setAutoSaving(false);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [watch, isDirty, id]);
  
  const onSubmit = async (data: WineFormData) => {
    setIsLoading(true);
    
    try {
      if (id) {
        await wineApi.update(parseInt(id), data);
        toast.success('Wine updated successfully');
      } else {
        await wineApi.create(data);
        toast.success('Wine created successfully');
      }
      navigate('/wines');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save wine');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePreviewMerge = async () => {
    try {
      const data = watch();
      const preview = await wineApi.previewMerge(data);
      
      if (preview.is_new) {
        toast.success('This will create a new wine');
      } else {
        toast.success(
          `Match found (${(preview.match_score * 100).toFixed(0)}% confidence). Will merge with wine #${preview.target_wine_id}`
        );
      }
    } catch (error: any) {
      toast.error('Failed to preview merge');
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary px-3 py-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Edit Wine' : 'New Wine'}
          </h1>
        </div>
        
        {autoSaving && (
          <span className="text-sm text-gray-500">Saving draft...</span>
        )}
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
        {/* Producer */}
        <div>
          <label htmlFor="producer_id" className="label">
            Producer <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="producer_id"
            className="input mt-1"
            {...register('producer_id', { valueAsNumber: true })}
          />
          {errors.producer_id && (
            <p className="mt-1 text-sm text-red-600">{errors.producer_id.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            TODO: Replace with searchable dropdown
          </p>
        </div>
        
        {/* Cuvée */}
        <div>
          <label htmlFor="cuvee" className="label">
            Cuvée / Label
          </label>
          <input
            type="text"
            id="cuvee"
            className="input mt-1"
            placeholder="e.g., Reserve, Grand Vin"
            {...register('cuvee')}
          />
        </div>
        
        {/* Vintage */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="vintage" className="label">
              Vintage
            </label>
            <input
              type="number"
              id="vintage"
              className="input mt-1"
              placeholder="e.g., 2020"
              disabled={isNv}
              {...register('vintage', { valueAsNumber: true })}
            />
            {errors.vintage && (
              <p className="mt-1 text-sm text-red-600">{errors.vintage.message}</p>
            )}
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                {...register('is_nv')}
                onChange={(e) => {
                  setValue('is_nv', e.target.checked);
                  if (e.target.checked) {
                    setValue('vintage', null);
                  }
                }}
              />
              <span className="text-sm text-gray-700">Non-Vintage (NV)</span>
            </label>
          </div>
        </div>
        
        {/* ABV */}
        <div>
          <label htmlFor="abv" className="label">
            ABV (%)
          </label>
          <input
            type="number"
            step="0.1"
            id="abv"
            className="input mt-1"
            placeholder="e.g., 13.5"
            {...register('abv', { valueAsNumber: true })}
          />
          {errors.abv && (
            <p className="mt-1 text-sm text-red-600">{errors.abv.message}</p>
          )}
        </div>
        
        {/* Wine Type */}
        <div>
          <label htmlFor="wine_type" className="label">
            Wine Type
          </label>
          <select
            id="wine_type"
            className="input mt-1"
            {...register('wine_type')}
          >
            <option value="">Select type</option>
            <option value="red">Red</option>
            <option value="white">White</option>
            <option value="rosé">Rosé</option>
            <option value="sparkling">Sparkling</option>
            <option value="fortified">Fortified</option>
            <option value="dessert">Dessert</option>
          </select>
        </div>
        
        {/* Notes */}
        <div>
          <label htmlFor="notes" className="label">
            Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            className="input mt-1"
            placeholder="Additional notes..."
            {...register('notes')}
          />
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <button
            type="button"
            onClick={handlePreviewMerge}
            className="btn-secondary px-4 py-2"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Merge
          </button>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary px-4 py-2"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Publish'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

