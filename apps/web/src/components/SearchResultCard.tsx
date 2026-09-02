export interface SearchResult {
  id?: string;
  name: string;
  address?: string;
  lng: number;
  lat: number;
  adname?: string;
  type?: string;
}

interface Props {
  result: SearchResult;
  onLocate: () => void;
}

export default function SearchResultCard({ result, onLocate }: Props) {
  return (
    <div className="result-card">
      <div className="result-card__header">
        <span className="result-card__name">{result.name}</span>
        {result.adname && <span className="result-card__tag">{result.adname}</span>}
      </div>
      {result.address && <div className="result-card__address">{result.address}</div>}
      <div className="result-card__footer">
        <span className="result-card__coord">
          {result.lng.toFixed(5)}, {result.lat.toFixed(5)}
        </span>
        <button className="result-card__locate" onClick={onLocate}>
          定位
        </button>
      </div>
    </div>
  );
}
