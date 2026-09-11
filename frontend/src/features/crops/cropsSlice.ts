import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CropsState {
  isReservationModalOpen: boolean;
  selectedCropId: number | null;
  isStageUpdateModalOpen: boolean;
  isAddTrackingModalOpen: boolean;
  isDetailDrawerOpen: boolean;
  selectedDetailCropId: number | null;
}

const initialState: CropsState = {
  isReservationModalOpen: false,
  selectedCropId: null,
  isStageUpdateModalOpen: false,
  isAddTrackingModalOpen: false,
  isDetailDrawerOpen: false,
  selectedDetailCropId: null,
};

const cropsSlice = createSlice({
  name: 'crops',
  initialState,
  reducers: {
    openReservationModal: (state, action: PayloadAction<number>) => {
      state.selectedCropId = action.payload;
      state.isReservationModalOpen = true;
    },
    closeReservationModal: (state) => {
      state.isReservationModalOpen = false;
      state.selectedCropId = null;
    },
    openStageUpdateModal: (state, action: PayloadAction<number>) => {
      state.selectedCropId = action.payload;
      state.isStageUpdateModalOpen = true;
    },
    closeStageUpdateModal: (state) => {
      state.isStageUpdateModalOpen = false;
      state.selectedCropId = null;
    },
    openAddTrackingModal: (state) => {
      state.isAddTrackingModalOpen = true;
    },
    closeAddTrackingModal: (state) => {
      state.isAddTrackingModalOpen = false;
    },
    openCropDetail: (state, action: PayloadAction<number>) => {
      state.selectedDetailCropId = action.payload;
      state.isDetailDrawerOpen = true;
    },
    closeCropDetail: (state) => {
      state.isDetailDrawerOpen = false;
      state.selectedDetailCropId = null;
    },
  },
});

export const {
  openReservationModal,
  closeReservationModal,
  openStageUpdateModal,
  closeStageUpdateModal,
  openAddTrackingModal,
  closeAddTrackingModal,
  openCropDetail,
  closeCropDetail,
} = cropsSlice.actions;

export default cropsSlice.reducer;
