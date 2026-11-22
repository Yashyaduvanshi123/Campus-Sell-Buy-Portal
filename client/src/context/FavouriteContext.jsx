import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const FavouriteContext = createContext(null);

export const FavouriteProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchFavourites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavouriteIds(new Set());
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/favourites');
      if (response.data.success) {
        const ids = new Set(response.data.data.map((item) => item.id));
        setFavouriteIds(ids);
      }
    } catch (error) {
      console.error('Failed to load favourites:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  const isFavourited = (productId) => {
    return favouriteIds.has(parseInt(productId, 10));
  };

  const toggleFavourite = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to save items to your favourites.');
      return false;
    }

    const pid = parseInt(product.id, 10);
    const currentlyFav = favouriteIds.has(pid);

    // Optimistic UI update
    setFavouriteIds((prev) => {
      const next = new Set(prev);
      if (currentlyFav) {
        next.delete(pid);
      } else {
        next.add(pid);
      }
      return next;
    });

    try {
      if (currentlyFav) {
        await api.delete(`/favourites/${pid}`);
        toast.success('Removed from favourites');
      } else {
        await api.post(`/favourites/${pid}`);
        toast.success('Added to favourites');
      }
      return true;
    } catch (error) {
      // Revert optimistic update on failure
      setFavouriteIds((prev) => {
        const next = new Set(prev);
        if (currentlyFav) {
          next.add(pid);
        } else {
          next.delete(pid);
        }
        return next;
      });
      toast.error('Failed to update favourite.');
      return false;
    }
  };

  return (
    <FavouriteContext.Provider value={{ favouriteIds, isFavourited, toggleFavourite, fetchFavourites, loading }}>
      {children}
    </FavouriteContext.Provider>
  );
};

export const useFavourites = () => {
  const context = useContext(FavouriteContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouriteProvider');
  }
  return context;
};
