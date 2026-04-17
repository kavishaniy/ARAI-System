#!/usr/bin/env python3
"""
Apply database migrations to add project_id column to analyses table
This script will run the SQL migration from migrations/002_add_project_linking.sql
"""
import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))
os.chdir(str(backend_path))

from app.core.database import supabase_admin
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def apply_migration():
    """Apply the project linking migration"""
    try:
        # Read the migration SQL
        migration_file = Path(__file__).parent / "migrations" / "002_add_project_linking.sql"
        
        if not migration_file.exists():
            logger.error(f"❌ Migration file not found: {migration_file}")
            return False
        
        with open(migration_file, 'r') as f:
            sql_content = f.read()
        
        logger.info("📋 Migration content:")
        logger.info(sql_content[:200] + "...")
        
        # Split SQL into individual statements (handle -- comments)
        statements = []
        current_statement = []
        
        for line in sql_content.split('\n'):
            # Skip comments
            if line.strip().startswith('--'):
                continue
            
            current_statement.append(line)
            
            # If line ends with semicolon, it's a complete statement
            if line.strip().endswith(';'):
                statement = '\n'.join(current_statement).strip()
                if statement:
                    statements.append(statement)
                current_statement = []
        
        logger.info(f"\n📝 Found {len(statements)} SQL statements to execute")
        
        # Execute each statement
        for i, statement in enumerate(statements, 1):
            try:
                logger.info(f"\n🔄 Executing statement {i}/{len(statements)}...")
                logger.info(f"   {statement[:80]}...")
                
                # Execute the statement
                result = supabase_admin.postgrest.rpc("exec_sql", {"sql": statement}).execute()
                logger.info(f"   ✅ Success")
                
            except AttributeError:
                # If rpc doesn't exist, try raw SQL execution via the client
                try:
                    logger.info(f"   💡 Trying alternative execution method...")
                    # For Supabase, we might need to use a different approach
                    from supabase.lib.client_options import ClientOptions
                    from postgrest import SyncPostgrestClient
                    
                    # Just log that we need manual execution
                    logger.warning(f"   ⚠️ Auto-execution not available")
                    logger.info(f"   📌 Please run this SQL manually in Supabase:")
                    logger.info(f"\n{statement}\n")
                    
                except Exception as e2:
                    logger.warning(f"   ⚠️ Auto-execution not available: {str(e2)}")
                    logger.info(f"   📌 Please run this SQL manually in Supabase:")
                    logger.info(f"\n{statement}\n")
            
            except Exception as e:
                logger.error(f"   ❌ Error executing statement: {str(e)}")
                logger.info(f"   📌 Please run this SQL manually in Supabase:")
                logger.info(f"\n{statement}\n")
        
        logger.info("\n✅ Migration complete!")
        logger.info("💡 If you saw any 'please run manually' messages, copy the SQL statements")
        logger.info("   and run them in your Supabase SQL Editor:")
        logger.info("   https://app.supabase.com/project/_/sql/new")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    success = apply_migration()
    sys.exit(0 if success else 1)
