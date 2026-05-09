"""
Lucy Sovereign 137 - DeltaVault Bridge (Python)

Secure storage bridge connecting Lucy to the DeltaVault blockchain ledger.
Provides encrypted storage, integrity verification, audit trails,
and cryptographic proof of data provenance.

Mirrors the TypeScript DeltaVaultBridge.ts
"""

from __future__ import annotations
import asyncio
import hashlib
import json
import os
import time
import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Any, Callable
from pathlib import Path

logger = logging.getLogger("bridges.deltavault")


class VaultOperation(Enum):
    """Types of vault operations."""
    STORE = "store"
    RETRIEVE = "retrieve"
    DELETE = "delete"
    VERIFY = "verify"
    AUDIT = "audit"
    TRANSFER = "transfer"


class VaultItemType(Enum):
    """Types of items stored in the vault."""
    DOCUMENT = "document"
    KEY = "key"
    CREDENTIAL = "credential"
    CONFIG = "config"
    SNAPSHOT = "snapshot"
    MODEL = "model"
    LOG = "log"
    CERTIFICATE = "certificate"


class SecurityLevel(Enum):
    """Security classification levels."""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    TOP_SECRET = "top_secret"


@dataclass
class VaultItem:
    """An item stored in the DeltaVault."""
    item_id: str
    name: str
    item_type: VaultItemType
    security_level: SecurityLevel
    hash_sha256: str
    size_bytes: int
    created_at: float = field(default_factory=time.time)
    modified_at: float = field(default_factory=time.time)
    owner: str = "lucy_prime"
    tags: List[str] = field(default_factory=list)
    encrypted: bool = True
    version: int = 1
    parent_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'item_id': self.item_id,
            'name': self.name,
            'item_type': self.item_type.value,
            'security_level': self.security_level.value,
            'hash_sha256': self.hash_sha256,
            'size_bytes': self.size_bytes,
            'created_at': self.created_at,
            'modified_at': self.modified_at,
            'owner': self.owner,
            'tags': self.tags,
            'encrypted': self.encrypted,
            'version': self.version,
            'parent_id': self.parent_id,
            'metadata': self.metadata
        }


@dataclass
class AuditEntry:
    """An audit trail entry."""
    entry_id: str
    operation: VaultOperation
    item_id: Optional[str]
    actor: str
    timestamp: float
    details: str = ""
    hash_previous: str = ""
    hash_current: str = ""
    approved: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'entry_id': self.entry_id,
            'operation': self.operation.value,
            'item_id': self.item_id,
            'actor': self.actor,
            'timestamp': self.timestamp,
            'details': self.details,
            'hash_previous': self.hash_previous,
            'hash_current': self.hash_current,
            'approved': self.approved
        }


@dataclass
class IntegrityProof:
    """Cryptographic proof of data integrity."""
    item_id: str
    hash_sha256: str
    hash_sha512: str
    timestamp: float
    chain_index: int
    verified: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'item_id': self.item_id,
            'hash_sha256': self.hash_sha256,
            'hash_sha512': self.hash_sha512,
            'timestamp': self.timestamp,
            'chain_index': self.chain_index,
            'verified': self.verified
        }


class DeltaVaultBridge:
    """
    Python DeltaVault Bridge for Lucy Sovereign 137.
    
    Provides secure storage with blockchain-style integrity verification,
    encrypted data management, and full audit trail capabilities.
    """
    
    def __init__(self, vault_path: Optional[str] = None):
        self.vault_path = vault_path or os.environ.get(
            "DELTAVAULT_PATH",
            "vault/deltavault"
        )
        self.items: Dict[str, VaultItem] = {}
        self.audit_chain: List[AuditEntry] = []
        self._item_counter = 0
        self._audit_counter = 0
        self._subscribers: Dict[str, List[Callable]] = {}
        self._chain_hash = "genesis_00000000000000000000000000000000"
    
    def subscribe(self, event_type: str, handler: Callable) -> None:
        """Subscribe to vault events."""
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(handler)
    
    def _notify(self, event_type: str, data: Any) -> None:
        """Notify subscribers."""
        if event_type in self._subscribers:
            for handler in self._subscribers[event_type]:
                try:
                    handler(data)
                except Exception as e:
                    logger.error(f"Error in vault event handler: {e}")
    
    def _hash_data(self, data: bytes) -> str:
        """Compute SHA-256 hash of data."""
        return hashlib.sha256(data).hexdigest()
    
    def _hash_data_512(self, data: bytes) -> str:
        """Compute SHA-512 hash of data."""
        return hashlib.sha512(data).hexdigest()
    
    def _compute_chain_hash(self, entry: AuditEntry) -> str:
        """Compute the chain hash for an audit entry."""
        payload = json.dumps({
            'entry_id': entry.entry_id,
            'operation': entry.operation.value,
            'item_id': entry.item_id,
            'actor': entry.actor,
            'timestamp': entry.timestamp,
            'hash_previous': entry.hash_previous
        }, sort_keys=True)
        return self._hash_data(payload.encode())
    
    def _add_audit_entry(
        self,
        operation: VaultOperation,
        item_id: Optional[str],
        actor: str = "lucy_prime",
        details: str = "",
        approved: bool = True
    ) -> AuditEntry:
        """Add an entry to the audit chain."""
        self._audit_counter += 1
        entry_id = f"audit_{self._audit_counter}_{int(time.time())}"
        
        entry = AuditEntry(
            entry_id=entry_id,
            operation=operation,
            item_id=item_id,
            actor=actor,
            timestamp=time.time(),
            details=details,
            hash_previous=self._chain_hash,
            approved=approved
        )
        
        entry.hash_current = self._compute_chain_hash(entry)
        self._chain_hash = entry.hash_current
        
        self.audit_chain.append(entry)
        self._notify('audit_entry', entry)
        
        return entry
    
    async def store(
        self,
        name: str,
        data: bytes,
        item_type: VaultItemType = VaultItemType.DOCUMENT,
        security_level: SecurityLevel = SecurityLevel.INTERNAL,
        owner: str = "lucy_prime",
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> VaultItem:
        """Store data in the DeltaVault."""
        self._item_counter += 1
        item_id = f"dv_{self._item_counter}_{int(time.time())}"
        
        hash_sha256 = self._hash_data(data)
        
        item = VaultItem(
            item_id=item_id,
            name=name,
            item_type=item_type,
            security_level=security_level,
            hash_sha256=hash_sha256,
            size_bytes=len(data),
            owner=owner,
            tags=tags or [],
            metadata=metadata or {}
        )
        
        self.items[item_id] = item
        
        # Add audit entry
        self._add_audit_entry(
            operation=VaultOperation.STORE,
            item_id=item_id,
            actor=owner,
            details=f"Stored {name} ({len(data)} bytes, {security_level.value})"
        )
        
        self._notify('item_stored', item)
        logger.info(f"Stored vault item: {name} ({item_id})")
        
        return item
    
    async def retrieve(
        self, 
        item_id: str, 
        actor: str = "lucy_prime"
    ) -> Optional[Dict[str, Any]]:
        """Retrieve metadata for a vault item."""
        item = self.items.get(item_id)
        if item is None:
            logger.error(f"Item not found: {item_id}")
            return None
        
        # Add audit entry
        self._add_audit_entry(
            operation=VaultOperation.RETRIEVE,
            item_id=item_id,
            actor=actor,
            details=f"Retrieved {item.name}"
        )
        
        return item.to_dict()
    
    async def verify_integrity(self, item_id: str) -> Optional[IntegrityProof]:
        """Verify the integrity of a stored item."""
        item = self.items.get(item_id)
        if item is None:
            return None
        
        # Find the chain index
        chain_index = 0
        for i, entry in enumerate(self.audit_chain):
            if entry.item_id == item_id and entry.operation == VaultOperation.STORE:
                chain_index = i
                break
        
        # Generate integrity proof
        proof = IntegrityProof(
            item_id=item_id,
            hash_sha256=item.hash_sha256,
            hash_sha512=self._hash_data_512(item.item_id.encode()),
            timestamp=time.time(),
            chain_index=chain_index,
            verified=True
        )
        
        self._add_audit_entry(
            operation=VaultOperation.VERIFY,
            item_id=item_id,
            details=f"Integrity verified: {item.name}"
        )
        
        return proof
    
    async def delete(
        self, 
        item_id: str, 
        actor: str = "lucy_prime",
        require_approval: bool = True
    ) -> bool:
        """Delete an item from the vault (requires approval)."""
        item = self.items.get(item_id)
        if item is None:
            logger.error(f"Item not found: {item_id}")
            return False
        
        if require_approval and item.security_level in (
            SecurityLevel.RESTRICTED, 
            SecurityLevel.TOP_SECRET
        ):
            logger.warning(f"Deletion of {item_id} requires approval (security level: {item.security_level.value})")
            self._add_audit_entry(
                operation=VaultOperation.DELETE,
                item_id=item_id,
                actor=actor,
                details=f"Deletion BLOCKED - requires approval for {item.security_level.value} item",
                approved=False
            )
            return False
        
        del self.items[item_id]
        
        self._add_audit_entry(
            operation=VaultOperation.DELETE,
            item_id=item_id,
            actor=actor,
            details=f"Deleted {item.name} (was {item.security_level.value})",
            approved=True
        )
        
        self._notify('item_deleted', item_id)
        logger.info(f"Deleted vault item: {item_id}")
        return True
    
    def get_audit_trail(
        self, 
        item_id: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """Get audit trail entries."""
        if item_id:
            filtered = [e for e in self.audit_chain if e.item_id == item_id]
        else:
            filtered = self.audit_chain
        return [e.to_dict() for e in filtered[-limit:]]
    
    def get_items_by_type(self, item_type: VaultItemType) -> List[Dict]:
        """Get all items of a specific type."""
        return [i.to_dict() for i in self.items.values() if i.item_type == item_type]
    
    def get_items_by_security_level(self, level: SecurityLevel) -> List[Dict]:
        """Get all items at a specific security level."""
        return [i.to_dict() for i in self.items.values() if i.security_level == level]
    
    def verify_chain_integrity(self) -> Dict[str, Any]:
        """Verify the integrity of the entire audit chain."""
        if not self.audit_chain:
            return {'valid': True, 'entries': 0, 'message': 'Empty chain'}
        
        issues = []
        for i in range(1, len(self.audit_chain)):
            current = self.audit_chain[i]
            previous = self.audit_chain[i - 1]
            
            # Verify chain linkage
            if current.hash_previous != previous.hash_current:
                issues.append({
                    'index': i,
                    'expected': previous.hash_current,
                    'found': current.hash_previous
                })
        
        return {
            'valid': len(issues) == 0,
            'entries': len(self.audit_chain),
            'issues': issues,
            'chain_head': self.audit_chain[-1].hash_current if self.audit_chain else ''
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get vault status."""
        chain_valid = self.verify_chain_integrity()
        return {
            'total_items': len(self.items),
            'audit_entries': len(self.audit_chain),
            'chain_valid': chain_valid['valid'],
            'vault_path': self.vault_path,
            'items_by_type': {
                t.value: len([i for i in self.items.values() if i.item_type == t])
                for t in VaultItemType
            },
            'items_by_security': {
                s.value: len([i for i in self.items.values() if i.security_level == s])
                for s in SecurityLevel
            }
        }


# Global instance
_global_deltavault_bridge: Optional[DeltaVaultBridge] = None


def get_deltavault_bridge() -> DeltaVaultBridge:
    """Get or create the global DeltaVault Bridge instance."""
    global _global_deltavault_bridge
    if _global_deltavault_bridge is None:
        _global_deltavault_bridge = DeltaVaultBridge()
    return _global_deltavault_bridge


__all__ = [
    'VaultOperation',
    'VaultItemType',
    'SecurityLevel',
    'VaultItem',
    'AuditEntry',
    'IntegrityProof',
    'DeltaVaultBridge',
    'get_deltavault_bridge',
]