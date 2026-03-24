export default function StarRating({ value, onChange, size = 'md', readonly = false }) {
  const s = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-base' : 'text-xl';
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((star) => (
        <button key={star} type="button" disabled={readonly}
          onClick={() => onChange && onChange(star)}
          className={`${s} transition-transform ${!readonly ? 'hover:scale-125 cursor-pointer' : 'cursor-default'} ${star <= value ? 'text-amber-400' : 'text-gray-200'}`}>
          ★
        </button>
      ))}
    </div>
  );
}
