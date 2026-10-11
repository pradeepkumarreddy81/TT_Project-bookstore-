import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import client from '@/api/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, Truck, MapPin, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  // Form fields
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Inline errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 font-sans">
        <EmptyState
          icon={ShoppingBag}
          title="No Editions Selected"
          description="Your bag must contain at least one volume before proceeding to dispatch."
          actionLabel="Return to Catalogue"
          actionLink="/books"
        />
      </main>
    );
  }

  const validateForm = () => {
    const errs = {};
    if (!recipientName.trim()) {
      errs.recipientName = 'Recipient name is required';
    }
    if (!streetAddress.trim()) {
      errs.streetAddress = 'Street address is required';
    }
    if (!city.trim()) {
      errs.city = 'City is required';
    }
    if (!postalCode.trim()) {
      errs.postalCode = 'Postal / ZIP code is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Assemble full structured address string for backend
      const fullAddressParts = [
        recipientName.trim(),
        streetAddress.trim() + (apartment.trim() ? `, ${apartment.trim()}` : ''),
        `${city.trim()}, ${stateRegion.trim()} ${postalCode.trim()}`,
        country.trim(),
      ];
      if (specialInstructions.trim()) {
        fullAddressParts.push(`(Instructions: ${specialInstructions.trim()})`);
      }
      const shippingAddress = fullAddressParts.join(' | ');

      const res = await client.post('/orders', { shippingAddress });
      const placedOrder = res.data?.data;

      success('Order registered successfully! Archival packaging initiated.');
      await fetchCart();
      navigate(`/orders/confirmed/${placedOrder.id}`, { state: { order: placedOrder } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order. Please inspect stock availability.';
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Breadcrumb Back */}
      <nav aria-label="Breadcrumb">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wide-label text-ink-muted hover:text-ink transition-colors mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Reading Bag
        </Link>
      </nav>

      {/* Header */}
      <div className="border-b border-paper-border pb-6 mb-10">
        <span className="text-xs uppercase tracking-wide-label font-bold text-terracotta block mb-1">
          Final Dispatch Step
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight-title">
          Shipping & Archival Delivery
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          Provide destination coordinates for tracked postal delivery in acid-free mailers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Structured Shipping Address Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            <div className="bg-paper-light border border-paper-border rounded p-6 sm:p-8 shadow-paper space-y-5">
              <h2 className="font-serif text-lg font-bold text-ink border-b border-paper-border pb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-terracotta" />
                <span>Reader Destination</span>
              </h2>

              <Input
                label="Recipient Full Name"
                value={recipientName}
                onChange={(e) => {
                  setRecipientName(e.target.value);
                  if (errors.recipientName) setErrors({ ...errors, recipientName: null });
                }}
                error={errors.recipientName}
                placeholder="e.g. Thomas Carlyle"
                required
              />

              <Input
                label="Street Address"
                value={streetAddress}
                onChange={(e) => {
                  setStreetAddress(e.target.value);
                  if (errors.streetAddress) setErrors({ ...errors, streetAddress: null });
                }}
                error={errors.streetAddress}
                placeholder="Number, street name, or library wing"
                required
              />

              <Input
                label="Apartment, Suite, or Unit (Optional)"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder="Apt 4B, Study 2"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (errors.city) setErrors({ ...errors, city: null });
                  }}
                  error={errors.city}
                  placeholder="London or Boston"
                  required
                />

                <Input
                  label="State / Province"
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  placeholder="MA"
                />

                <Input
                  label="Postal / ZIP Code"
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    if (errors.postalCode) setErrors({ ...errors, postalCode: null });
                  }}
                  error={errors.postalCode}
                  placeholder="02138"
                  required
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide-label text-ink-muted font-medium select-none block mb-1.5">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-10 px-3.5 text-sm bg-paper-light border border-paper-border rounded text-ink outline-none focus:border-ink transition-colors"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Japan">Japan</option>
                  <option value="India">India</option>
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide-label text-ink-muted font-medium select-none block mb-1.5">
                  Delivery Notes / Courier Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Leave with building porter or ring library bell..."
                  className="w-full p-3 text-xs bg-paper-light border border-paper-border rounded text-ink placeholder:text-ink-subtle outline-none focus:border-ink transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-12"
              isLoading={isSubmitting}
            >
              <span>Confirm & Place Order (${Number(cart.totalPrice).toFixed(2)})</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>

        {/* Right Column: Order Manifest & Delivery Summary */}
        <div className="lg:col-span-5">
          <div className="bg-paper-light border border-paper-border rounded p-6 sm:p-8 shadow-book sticky top-24">
            <h2 className="font-serif text-lg font-bold text-ink border-b border-paper-border pb-3 mb-4">
              Order Manifest ({items.length} {items.length === 1 ? 'title' : 'titles'})
            </h2>

            <div className="divide-y divide-paper-border max-h-72 overflow-y-auto pr-1 mb-6">
              {items.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3 text-xs">
                  <img
                    src={item.bookImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                    alt={item.bookTitle}
                    className="w-10 h-14 object-cover rounded border border-paper-border shrink-0 bg-paper-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-ink truncate">{item.bookTitle}</h4>
                    <p className="text-[11px] text-ink-muted truncate">{item.bookAuthor}</p>
                    <span className="text-[10px] text-ink-subtle">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-serif font-bold text-ink shrink-0">
                    ${Number(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-paper-border space-y-3 text-xs text-ink-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-ink font-medium">${Number(cart.totalPrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tracked Courier Dispatch</span>
                <span className="text-forest font-semibold uppercase text-[10px] tracking-wide-label">
                  Complimentary
                </span>
              </div>
              <div className="flex justify-between">
                <span>Acid-Free Archival Packing</span>
                <span className="text-forest font-semibold uppercase text-[10px] tracking-wide-label">
                  Complimentary
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-paper-border flex justify-between items-baseline">
              <span className="font-serif text-base font-bold text-ink">Total to Pay</span>
              <span className="font-serif text-2xl font-bold text-terracotta">
                ${Number(cart.totalPrice).toFixed(2)}
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-paper-border space-y-2 text-[11px] text-ink-subtle">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-forest shrink-0" />
                <span>Orders ship within 24 hours via tracked postal service.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-forest shrink-0" />
                <span>Guaranteed archival condition on arrival.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
