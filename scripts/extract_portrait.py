import cv2
import numpy as np
from PIL import Image

input_path = "public/images/atif-portrait.jpg"
output_isolated_path = "public/images/atif-portrait-isolated.png"
output_mask_path = "public/images/atif-portrait-mask.png"

print("Loading original image and initial DeepLab mask...")
orig_img = Image.open(input_path).convert("RGB")
img_np = np.array(orig_img)
h, w, _ = img_np.shape

# Load the mask we generated
mask_img = Image.open(output_mask_path).convert("L")
mask_np = np.array(mask_img)

# 1. Clear out edge artifacts
# Clear white prop edge on far left edge and far right edge
mask_np[:, :int(w * 0.06)] = 0
mask_np[:, int(w * 0.88):] = 0

# Clear any noise below hands (bottom margin)
mask_np[int(h * 0.98):, :] = 0

# 2. Clean up the cast shadow on the left of the neck and shoulder
# In the original image, the wall background (and cast shadow) has distinct RGB compared to the sweatshirt:
# The wall shadow is around RGB (60, 60, 65) whereas the sweatshirt is deep black (20, 20, 25)
# In the region x < 0.32 * w and y between 0.30 * h and 0.52 * h:
for y in range(int(h * 0.30), int(h * 0.52)):
    for x in range(int(w * 0.06), int(w * 0.32)):
        if mask_np[y, x] > 0:
            r, g, b = img_np[y, x]
            lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
            # The wall cast shadow has lum between 0.22 and 0.35 and is relatively smooth
            # Check gradient with neighbors
            gx = abs(int(img_np[y, x + 2][0]) - int(img_np[y, x - 2][0]))
            gy = abs(int(img_np[y + 2, x][0]) - int(img_np[y - 2, x][0]))
            edge = gx + gy
            if lum > 0.23 and edge < 12:
                mask_np[y, x] = 0

# Also run GrabCut using the refined mask
# Initialize GrabCut mask
# 0: GC_BGD, 1: GC_FGD, 2: GC_PR_BGD, 3: GC_PR_FGD
gc_mask = np.zeros((h, w), np.uint8)
gc_mask[mask_np > 180] = cv2.GC_PR_FGD
gc_mask[mask_np <= 50] = cv2.GC_BGD

# Definite foreground: face, neck center, and inner torso
gc_mask[int(h * 0.15):int(h * 0.70), int(w * 0.30):int(w * 0.65)] = cv2.GC_FGD

# Definite background: corners and outer background
gc_mask[:int(h * 0.06), :] = cv2.GC_BGD
gc_mask[:, :int(w * 0.05)] = cv2.GC_BGD
gc_mask[:, int(w * 0.88):] = cv2.GC_BGD

bgdModel = np.zeros((1, 65), np.float64)
fgdModel = np.zeros((1, 65), np.float64)

cv2.grabCut(img_np, gc_mask, None, bgdModel, fgdModel, 3, cv2.GC_INIT_WITH_MASK)

# Final binary mask: where grabcut says foreground (1) or probable foreground (3)
final_mask = np.where((gc_mask == cv2.GC_FGD) | (gc_mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)

# Remove tiny isolated islands
num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(final_mask)
if num_labels > 1:
    largest_label = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
    final_mask = np.where(labels == largest_label, 255, 0).astype(np.uint8)

# Feather the edge slightly for fine organic particles
final_mask_feathered = cv2.GaussianBlur(final_mask, (5, 5), 0)

# Save refined images
rgba = np.dstack([img_np, final_mask_feathered])
Image.fromarray(rgba).save(output_isolated_path)
Image.fromarray(final_mask_feathered).save(output_mask_path)

print("Saved refined isolated portrait and mask!")
