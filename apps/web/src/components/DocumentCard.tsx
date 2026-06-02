import { BookOpen, Building2, Calendar, ChevronRight, Download, Eye, FileText, Star, User } from "lucide-react";
import { type DocumentItem } from "../data/mockDocuments";
import { VerificationBadge } from "./VerificationBadge";

type DocumentCardProps = {
  document: DocumentItem;
  onClick: (document: DocumentItem) => void;
};

export function DocumentCard({ document, onClick }: DocumentCardProps) {
  return (
    <article className="document-card">
      <button className="document-card__body" type="button" onClick={() => onClick(document)}>
        <div className="document-card__icon">
          <FileText size={28} />
        </div>

        <div className="document-card__content">
          <div className="document-card__meta">
            <VerificationBadge level={document.verification} size="sm" />
            <span>{document.type}</span>
            <span>{document.year}</span>
          </div>
          <h2>{document.title}</h2>
          <p>{document.description}</p>

          <div className="document-card__details">
            <span>
              <User size={14} /> {document.author}
            </span>
            <span>
              <Building2 size={14} /> {document.institution}
            </span>
            <span>
              <BookOpen size={14} /> {document.subject}
            </span>
          </div>

          <div className="tag-row">
            {document.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>

        <div className="document-card__stats">
          <div className="rating">
            <Star size={16} fill="currentColor" />
            <strong>{document.rating}</strong>
            <span>({document.reviews})</span>
          </div>
          <span>
            <Download size={14} /> {document.downloads.toLocaleString("vi-VN")}
          </span>
          <span>
            <Eye size={14} /> {document.views.toLocaleString("vi-VN")}
          </span>
          <span>
            <Calendar size={14} /> {document.pages} trang
          </span>
          <ChevronRight className="document-card__arrow" size={20} />
        </div>
      </button>
    </article>
  );
}
