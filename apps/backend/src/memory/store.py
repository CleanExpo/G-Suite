"""Memory Store - Core CRUD and vector search for domain memory.

This module provides the foundational storage and retrieval layer for all
memory types, implementing semantic search via pgvector and efficient CRUD operations.
"""

import json
from typing import Any, Optional
from uuid import UUID

from src.memory.models import (
    MemoryDomain,
    MemoryEntry,
    MemoryQuery,
    MemoryResult,
)
from src.state.supabase import SupabaseStateStore
from src.utils import get_logger

logger = get_logger(__name__)


class MemoryStore:
    """Core storage and retrieval for domain memory with vector search.

    This class handles all CRUD operations for memory entries and provides
    semantic search capabilities using pgvector embeddings.

    Usage:
        store = MemoryStore()
        await store.initialize()

        # Create memory
        entry = await store.create(
            domain=MemoryDomain.KNOWLEDGE,
            category="architecture",
            key="api_authentication",
            value={"pattern": "OAuth 2.0 with PKCE"},
            user_id=user_id,
        )

        # Query memories
        results = await store.query(
            MemoryQuery(
                domain=MemoryDomain.KNOWLEDGE,
                category="architecture",
                user_id=user_id,
            )
        )

        # Semantic search
        similar = await store.find_similar(
            query_text="How does authentication work?",
            domain=MemoryDomain.KNOWLEDGE,
            user_id=user_id,
        )
    """

    def __init__(self) -> None:
        """Initialize the memory store."""
        self.supabase = SupabaseStateStore()
        self.client = self.supabase.client
        self.embedding_provider: Optional[Any] = None  # Will be set in initialize()

    async def initialize(self) -> None:
        """Initialize the store and dependencies."""
        # Import embeddings here to avoid circular imports
        from src.memory.embeddings import get_embedding_provider

        self.embedding_provider = get_embedding_provider()
        logger.info("Memory store initialized")

    # =========================================================================
    # CRUD Operations
    # =========================================================================

    async def create(
        self,
        domain: MemoryDomain,
        category: str,
        key: str,
        value: dict[str, Any],
        user_id: Optional[str] = None,
        source: Optional[str] = None,
        tags: Optional[list[str]] = None,
        generate_embedding: bool = True,
    ) -> MemoryEntry:
        """Create a new memory entry.

        Args:
            domain: Memory domain (knowledge, preference, testing, debugging)
            category: Sub-category within domain
            key: Unique key within category
            value: Memory content as JSON dict
            user_id: Optional user ID for user-specific memories
            source: Optional source of this memory
            tags: Optional tags for categorization
            generate_embedding: Whether to generate vector embedding

        Returns:
            Created MemoryEntry

        Raises:
            Exception: If creation fails
        """
        # Generate embedding if requested
        embedding = None
        if generate_embedding and self.embedding_provider:
            # Create text representation for embedding
            text = self._memory_to_text(domain, category, key, value)
            embedding = await self.embedding_provider.get_embedding(text)

        # Prepare data
        data = {
            "domain": domain.value if isinstance(domain, MemoryDomain) else domain,
            "category": category,
            "key": key,
            "value": value,
            "user_id": user_id,
            "source": source,
            "tags": tags or [],
            "embedding": embedding,
        }

        # Insert into database
        result = (
            self.client.table("domain_memories")
            .insert(data)
            .execute()
        )

        if not result.data:
            raise Exception("Failed to create memory entry")

        entry_data = result.data[0]
        logger.info(
            "Memory created",
            domain=domain,
            category=category,
            key=key,
            user_id=user_id,
        )

        return MemoryEntry(**entry_data)

    async def get(
        self,
        memory_id: str,
        increment_access: bool = True,
    ) -> Optional[MemoryEntry]:
        """Get a memory entry by ID.

        Args:
            memory_id: Memory entry ID
            increment_access: Whether to increment access count

        Returns:
            MemoryEntry if found, None otherwise
        """
        result = (
            self.client.table("domain_memories")
            .select("*")
            .eq("id", memory_id)
            .execute()
        )

        if not result.data:
            return None

        entry_data = result.data[0]

        # Increment access count if requested
        if increment_access:
            await self._increment_access(memory_id)
            entry_data["access_count"] += 1

        return MemoryEntry(**entry_data)

    async def update(
        self,
        memory_id: str,
        updates: dict[str, Any],
        regenerate_embedding: bool = False,
    ) -> Optional[MemoryEntry]:
        """Update a memory entry.

        Args:
            memory_id: Memory entry ID
            updates: Fields to update
            regenerate_embedding: Whether to regenerate embedding

        Returns:
            Updated MemoryEntry if found, None otherwise
        """
        # Regenerate embedding if requested and value changed
        if regenerate_embedding and "value" in updates and self.embedding_provider:
            # Get current entry to build text
            current = await self.get(memory_id, increment_access=False)
            if current:
                text = self._memory_to_text(
                    current.domain,
                    current.category,
                    current.key,
                    updates.get("value", current.value),
                )
                updates["embedding"] = await self.embedding_provider.get_embedding(text)

        result = (
            self.client.table("domain_memories")
            .update(updates)
            .eq("id", memory_id)
            .execute()
        )

        if not result.data:
            return None

        logger.info("Memory updated", memory_id=memory_id, updates=list(updates.keys()))
        return MemoryEntry(**result.data[0])

    async def delete(self, memory_id: str) -> bool:
        """Delete a memory entry.

        Args:
            memory_id: Memory entry ID

        Returns:
            True if deleted, False if not found
        """
        result = (
            self.client.table("domain_memories")
            .delete()
            .eq("id", memory_id)
            .execute()
        )

        success = bool(result.data)
        if success:
            logger.info("Memory deleted", memory_id=memory_id)
        return success

    # =========================================================================
    # Query Operations
    # =========================================================================

    async def query(self, query: MemoryQuery) -> MemoryResult:
        """Query memories with filters and pagination.

        Args:
            query: MemoryQuery with filters and pagination

        Returns:
            MemoryResult with matching entries and metadata
        """
        # Build query
        db_query = self.client.table("domain_memories").select("*")

        # Apply filters
        if query.domain:
            domain_value = query.domain.value if isinstance(query.domain, MemoryDomain) else query.domain
            db_query = db_query.eq("domain", domain_value)
        if query.category:
            db_query = db_query.eq("category", query.category)
        if query.key:
            db_query = db_query.eq("key", query.key)
        if query.user_id:
            db_query = db_query.eq("user_id", query.user_id)
        if query.min_relevance > 0:
            db_query = db_query.gte("relevance_score", query.min_relevance)

        # Tag filter (contains all specified tags)
        if query.tags:
            for tag in query.tags:
                db_query = db_query.contains("tags", [tag])

        # Order by created_at descending
        db_query = db_query.order("created_at", desc=True)

        # Pagination
        db_query = db_query.range(query.offset, query.offset + query.limit - 1)

        # Execute
        result = db_query.execute()

        # Convert to MemoryEntry objects
        entries = [MemoryEntry(**data) for data in result.data]

        # Get total count (without pagination)
        count_query = self.client.table("domain_memories").select("id", count="exact")
        if query.domain:
            domain_value = query.domain.value if isinstance(query.domain, MemoryDomain) else query.domain
            count_query = count_query.eq("domain", domain_value)
        if query.category:
            count_query = count_query.eq("category", query.category)
        if query.user_id:
            count_query = count_query.eq("user_id", query.user_id)

        count_result = count_query.execute()
        total_count = count_result.count or 0

        logger.debug(
            "Memory query executed",
            domain=query.domain,
            category=query.category,
            found=len(entries),
            total=total_count,
        )

        return MemoryResult(
            entries=entries,
            total_count=total_count,
            query=query,
        )

    # =========================================================================
    # Semantic Search
    # =========================================================================

    async def find_similar(
        self,
        query_text: str,
        domain: Optional[MemoryDomain] = None,
        user_id: Optional[str] = None,
        similarity_threshold: float = 0.7,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """Find similar memories using vector search.

        Args:
            query_text: Text to search for
            domain: Optional domain filter
            user_id: Optional user filter
            similarity_threshold: Minimum similarity score (0-1)
            limit: Maximum number of results

        Returns:
            List of dicts with memory data and similarity scores
        """
        if not self.embedding_provider:
            raise Exception("Embedding provider not initialized")

        # Generate embedding for query
        query_embedding = await self.embedding_provider.get_embedding(query_text)

        # Call database function for vector search
        result = self.client.rpc(
            "find_similar_memories",
            {
                "query_embedding": json.dumps(query_embedding),  # Convert to JSON string
                "match_threshold": similarity_threshold,
                "match_count": limit,
                "filter_domain": domain.value if domain else None,
                "filter_user_id": user_id,
            },
        ).execute()

        logger.debug(
            "Vector search executed",
            query_text=query_text[:100],
            domain=domain,
            found=len(result.data) if result.data else 0,
        )

        return result.data or []

    # =========================================================================
    # Maintenance Operations
    # =========================================================================

    async def prune_stale(
        self,
        min_relevance: float = 0.3,
        max_age_days: int = 90,
    ) -> int:
        """Prune stale memories with low relevance or old age.

        Args:
            min_relevance: Minimum relevance score to keep
            max_age_days: Maximum age in days for unused memories

        Returns:
            Number of memories deleted
        """
        result = self.client.rpc(
            "prune_stale_memories",
            {
                "min_relevance": min_relevance,
                "max_age_days": max_age_days,
            },
        ).execute()

        deleted_count = result.data or 0
        logger.info(
            "Stale memories pruned",
            deleted_count=deleted_count,
            min_relevance=min_relevance,
            max_age_days=max_age_days,
        )

        return deleted_count

    async def update_relevance(
        self,
        memory_id: str,
        feedback: float,
        decay_rate: float = 0.1,
    ) -> bool:
        """Update memory relevance based on feedback.

        Args:
            memory_id: Memory entry ID
            feedback: Feedback score (-1 to 1, where 1 is very relevant)
            decay_rate: How much to decay on negative feedback

        Returns:
            True if updated successfully
        """
        entry = await self.get(memory_id, increment_access=False)
        if not entry:
            return False

        # Calculate new relevance
        if feedback > 0:
            # Positive feedback increases relevance (max 1.0)
            new_relevance = min(1.0, entry.relevance_score + (feedback * 0.1))
        else:
            # Negative feedback decreases relevance
            new_relevance = max(0.0, entry.relevance_score - decay_rate)

        await self.update(memory_id, {"relevance_score": new_relevance})
        logger.debug(
            "Relevance updated",
            memory_id=memory_id,
            old=entry.relevance_score,
            new=new_relevance,
        )

        return True

    # =========================================================================
    # Helper Methods
    # =========================================================================

    async def _increment_access(self, memory_id: str) -> None:
        """Increment access count for a memory."""
        self.client.rpc("increment_memory_access", {"memory_id": memory_id}).execute()

    def _memory_to_text(
        self,
        domain: MemoryDomain,
        category: str,
        key: str,
        value: dict[str, Any],
    ) -> str:
        """Convert memory entry to text for embedding generation.

        Args:
            domain: Memory domain
            category: Category
            key: Key
            value: Value dict

        Returns:
            Text representation for embedding
        """
        # Build text representation
        text_parts = [
            f"Domain: {domain}",
            f"Category: {category}",
            f"Key: {key}",
        ]

        # Add value fields
        if isinstance(value, dict):
            for k, v in value.items():
                if isinstance(v, (str, int, float, bool)):
                    text_parts.append(f"{k}: {v}")
                elif isinstance(v, list) and all(isinstance(item, str) for item in v):
                    text_parts.append(f"{k}: {', '.join(v)}")

        return " | ".join(text_parts)
